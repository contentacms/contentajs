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
    // We have a list of the JSON API resources available in Contenta CMS. This
    // list is a list of regular expressions that can match any path a resource,
    // taking variables into account. Filter the requests that are for
    // non-existing resources.
    filter(pRq, uRq) {
      // Extract the path part, without query string, of the current request.
      const parsed = url.parse(uRq.url);
      const pathIsWhitelisted =
        // Only filter paths if there are any whitelisted paths.
        uRq.jsonApiPaths.length &&
        // Return false if it doesn't apply any regular expression path.
        !!uRq.jsonApiPaths.find(p => new RegExp(p).test(parsed.pathname || ''));
      // Make sure that the JSON API entry point is also whitelisted.
      return parsed.pathname === '/' || pathIsWhitelisted;
    },
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
