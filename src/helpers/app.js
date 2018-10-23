// @flow

/**
 * Base application definition.
 */

const _ = require('lodash');
const bodyParser = require('body-parser');
const config = require('config');
const cors = require('cors');
const express = require('express');
const { globalAgent: httpGlobalAgent } = require('http');
const { globalAgent: httpsGlobalAgent } = require('https');

const cacheControl = require('../middlewares/cacheControl');
const copyToRequestObject = require('../middlewares/copyToRequestObject');
const errorHandler = require('../middlewares/errorHandler');
const healthcheck = require('../routes/healthcheck');
const jsonrpcProxy = require('../routes/jsonrpcProxy');
const proxyHandler = require('../routes/proxyHandler');
const { initSubrequests } = require('../routes/subrequests');
const apolloServerWithContext = require('./graphql/apolloServerWithContext');

module.exports = async (cmsMeta: Object) => {
  const app = express();
  app.disable('x-powered-by');

  // Enable etags.
  app.enable('etag');
  app.set('etag', 'strong');
  const jsonApiPrefix = _.get(cmsMeta, 'jsonApiPrefix', '/jsonapi');
  const jsonApiPaths = JSON.parse(_.get(cmsMeta, 'jsonApiPaths', '[]'));
  const cmsHost = config.get('cms.host');

  // Set the global agent options
  const agentOptions = config.util.toObject(config.get('cms.httpAgent'));
  Object.keys(agentOptions).forEach(key => {
    _.set(httpGlobalAgent, [key], agentOptions[key]);
    _.set(httpsGlobalAgent, [key], agentOptions[key]);
  });

  const corsHandler = cors(config.util.toObject(config.get('cors')));
  app.use(corsHandler);
  // Adds support for preflight OPTIONS requests on all routes.
  app.options('*', corsHandler);

  // Initialize the request object with valuable information.
  app.use(copyToRequestObject({ jsonApiPrefix, jsonApiPaths, cmsHost }));

  // Healthcheck is a special endpoint used for application monitoring.
  app.get('/healthcheck', healthcheck);

  // Set cache control header.
  app.use(cacheControl);

  // Proxy for the JSON API server in Contenta CMS.
  app.use(jsonApiPrefix, bodyParser.json({ type: 'application/vnd.api+json' }));
  app.use(jsonApiPrefix, proxyHandler);
  // Forward JSON RPC requests to the CMS.
  app.use('/jsonrpc', jsonrpcProxy);

  initSubrequests(app);

  // Fallback error handling. If there is any unhandled exception or error,
  // catch them here to allow the app to continue normally.
  app.use(errorHandler);

  const apolloServer = await apolloServerWithContext({
    cmsHost,
    jsonApiPrefix,
  });
  apolloServer.applyMiddleware({
    app,
    path: '/graphql',
  });

  return app;
};
