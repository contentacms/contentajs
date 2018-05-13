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
const response = require('./response');
const errorHandler = require('./errorHandler');

const app = express();

// Enable etags.
app.enable('etag');
app.set('etag', 'strong');

// Add headers.
app.use((req, res, next) => {
  res.set('x-powered-by', config.get('app.name.machine'));
  // Enable CORS.
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', config.get('cors.headers').join(', '));

  next();
});

// Healthcheck is a special endpoint used for application monitoring.
app.get('/healthcheck', (req, res) => {
  res.set('Cache-Control', 'private, max-age=0, no-cache');
  res.json({ meta: { healthcheck: 'good' } });
});

const jsonApiPrefix = '/api';

// Proxy for the JSON API server in Contenta CMS.
app.use(jsonApiPrefix, bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(jsonApiPrefix, proxy(cmsHost, {
  proxyReqPathResolver(req) {
    const thePath: string = _.get(url.parse(req.url), 'path', '');
    return `${jsonApiPrefix}${thePath}`;
  },
  proxyReqBodyDecorator(bodyContent, srcReq) {
    if (['GET', 'HEAD', 'OPTIONS', 'TRACE'].indexOf(srcReq.method) !== -1) {
      return '';
    }
    if (typeof srcReq.headers['content-type'] === 'undefined') {
      logger.warn('The request body was ignored because the Content-Type header is not present.');
      return '';
    }
    return bodyContent;
  },
}));

// Set cache control header.
app.use(cacheControl);

// Send the response.
app.use(response);

// Fallback error handling. If there is any unhandled exception or error,
// catch them here to allow the app to continue normally.
app.use(errorHandler);

module.exports = app;
