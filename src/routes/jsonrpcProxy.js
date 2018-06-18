// @flow

import type {
  $Request as Request,
  $Response as Response,
  NextFunction,
} from 'express';

const proxy = require('express-http-proxy');

module.exports = (req: Request, res: Response, next: NextFunction): void => {
  return proxy(req.cmsHost, {
    proxyReqPathResolver: req => `/jsonrpc${req.url}`,
  })(req, res, next);
};
