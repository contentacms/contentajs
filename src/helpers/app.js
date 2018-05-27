// @flow

/**
 * Base application definition.
 */

const _ = require('lodash');
const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');
const logger = require('pino')();
const proxy = require('express-http-proxy');
const url = require('url');

const cmsHost = config.get('cms.host');

const cacheControl = require('./cacheControl');
const errorHandler = require('./errorHandler');
const { redisGet } = require('../caching/drupalRedis')(
  _.get(process, 'env.redisPrefix', ''),
  _.get(process, 'env.redisCidTemplate', ''),
  config.get('redis.pool')
);

const app = express();
app.disable('x-powered-by');

// Enable etags.
app.enable('etag');
app.set('etag', 'strong');

// Add headers.
app.use((req, res, next) => {
  res.set('x-powered-by', config.get('app.name.machine'));
  // Enable CORS.
  res.set('Access-Control-Allow-Origin', '*');
  res.set(
    'Access-Control-Allow-Headers',
    config.get('cors.headers').join(', ')
  );

  next();
});

// Healthcheck is a special endpoint used for application monitoring.
app.get('/healthcheck', (req, res) => {
  res.set('Cache-Control', 'private, max-age=0, no-cache');
  res.json({ meta: { healthcheck: 'good' } });
});

// Set cache control header.
app.use(cacheControl);

const jsonApiPrefix = `/${_.get(process, 'env.jsonApiPrefix')}`;
// Proxy for the JSON API server in Contenta CMS.
app.use(jsonApiPrefix, bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(
  jsonApiPrefix,
  // Try to load from cache, then fallback to the CMS.
  (req, res, next) => {
    const fallbackToCms = proxy(cmsHost, {
      proxyReqPathResolver(rq) {
        const thePath: string = _.get(url.parse(rq.url), 'path', '');
        return `${jsonApiPrefix}${thePath}`;
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
    redisGet(`${cmsHost}${req.originalUrl}:html`)
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
  }
);

// Fallback error handling. If there is any unhandled exception or error,
// catch them here to allow the app to continue normally.
app.use(errorHandler);

module.exports = app;
