// @flow

/**
 * Base application definition.
 */

const _ = require('lodash');
const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');

const cmsHost = config.get('cms.host');

const cacheControl = require('./cacheControl');
const errorHandler = require('./errorHandler');
const proxyHandler = require('./proxyHandler');

const app = express();
app.disable('x-powered-by');

// Enable etags.
app.enable('etag');
app.set('etag', 'strong');
const jsonApiPrefix = `/${_.get(process, 'env.jsonApiPrefix')}`;

// Add headers.
app.use((req, res, next) => {
  // Enable CORS.
  res.set('Access-Control-Allow-Origin', '*');
  res.set(
    'Access-Control-Allow-Headers',
    config.get('cors.headers').join(', ')
  );

  // Set the cmsHost and jsonApiPrefix in the request.
  req.cmsHost = cmsHost;
  req.jsonApiPrefix = jsonApiPrefix;

  next();
});

// Healthcheck is a special endpoint used for application monitoring.
app.get('/healthcheck', (req, res) => {
  res.set('Cache-Control', 'private, max-age=0, no-cache');
  res.json({ meta: { healthcheck: 'good' } });
});

// Set cache control header.
app.use(cacheControl);

// Proxy for the JSON API server in Contenta CMS.
app.use(jsonApiPrefix, bodyParser.json({ type: 'application/vnd.api+json' }));
// Try to load from cache, then fallback to the CMS.
app.use(jsonApiPrefix, proxyHandler);

// Fallback error handling. If there is any unhandled exception or error,
// catch them here to allow the app to continue normally.
app.use(errorHandler);

module.exports = app;
