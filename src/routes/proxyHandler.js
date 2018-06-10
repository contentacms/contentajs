// @flow

import type {
  $Request as Request,
  $Response as Response,
  NextFunction,
} from 'express';

const _ = require('lodash');
const logger = require('pino')();
const proxy = require('express-http-proxy');
const url = require('url');

const cacheControl = require('../middlewares/cacheControl');
const errorHandler = require('../middlewares/errorHandler');

/**
 * Middleware to send the requests to Contenta CMS.
 *
 * This uses 'express-http-proxy' which terminates the request after proxying.
 */
module.exports = (req: Request, res: Response, next: NextFunction): void => {
  const options = {
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
  };
  return proxy(req.cmsHost, options)(req, res, next);
};
