// @flow

/**
 * Base application definition.
 */

const _ = require('lodash');
const bodyParser = require('body-parser');
const config = require('config');
const cors = require('cors');
const express = require('express');

const cacheControl = require('../middlewares/cacheControl');
const copyToRequestObject = require('../middlewares/copyToRequestObject');
const errorHandler = require('../middlewares/errorHandler');
const healthcheck = require('../routes/healthcheck');
const proxyHandler = require('../routes/proxyHandler');
const { initSubrequests } = require('../routes/subrequests');

const app = express();
app.disable('x-powered-by');

// Enable etags.
app.enable('etag');
app.set('etag', 'strong');
const jsonApiPrefix = _.get(process, 'env.jsonApiPrefix', '/jsonapi');
const jsonApiPaths = JSON.parse(_.get(process, 'env.jsonApiPaths', '[]'));
const cmsHost = config.get('cms.host');

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
// Try to load from cache, then fallback to the CMS.
app.use(jsonApiPrefix, proxyHandler);

initSubrequests(app);

// Fallback error handling. If there is any unhandled exception or error,
// catch them here to allow the app to continue normally.
app.use(errorHandler);

module.exports = app;
