// @flow

const _ = require('lodash');
const config = require('config');
const logger = require('pino')();
const proxy = require('express-http-proxy');
const url = require('url');

const cacheControl = require('./cacheControl');
const errorHandler = require('./errorHandler');
const { redisGet } = require('../caching/drupalRedis')(
  _.get(process, 'env.redisPrefix', ''),
  _.get(process, 'env.redisCidTemplate', ''),
  config.get('redis.pool')
);

/**
 * Tries to load an API request to the CMS from cache then from the CMS.
 *
 * If the request is not present/valid in the cache, then it's when we bother
 * the CMS with the request.
 */
module.exports = (req: any, res: any, next: Function): void => {
  const fallbackToCms = proxy(req.cmsHost, {
    proxyReqPathResolver(rq) {
      const thePath: string = _.get(url.parse(rq.url), 'path', '');
      return `${req.jsonApiPrefix}${thePath}`;
    },
    proxyReqBodyDecorator(bodyContent, srcReq) {
      if (['GET', 'HEAD', 'OPTIONS', 'TRACE'].indexOf(srcReq.method) !== -1) {
        return '';
      }
      if (typeof srcReq.headers['content-type'] === 'undefined') {
        logger.warn(
          'The request body was ignored because the Content-Type header is not present.'
        );
        return '';
      }
      return bodyContent;
    },
    proxyErrorHandler: (err, eRes, eNext) =>
      errorHandler(err, req, eRes, eNext),
    userResHeaderDecorator(headers, userReq) {
      // Make sure to overwrite the cache control headers set by the CMS.
      const fakeRes = {
        set(k, v) {
          headers[k] = v;
        },
      };
      cacheControl(userReq, fakeRes, () => {});
      return headers;
    },
  });
  redisGet(`${req.cmsHost}${req.originalUrl}:html`)
    .then(cached => {
      if (!cached) {
        fallbackToCms(req, res, next);
        return;
      }
      res.send(cached);
    })
    .catch(error => {
      logger.error(error);
      fallbackToCms(req, res, next);
    });
};
