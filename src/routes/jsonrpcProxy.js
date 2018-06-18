// @flow

import type { $Request as Request } from 'express';

const proxy = require('express-http-proxy');

module.exports = (req: Request): void => {
  proxy(req.cmsHost, {
    proxyReqPathResolver: req => `/jsonrpc${req.url}`,
  });
};
