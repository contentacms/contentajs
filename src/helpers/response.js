// @flow

const _ = require('lodash');
const createError = require('http-errors');

module.exports = (req: any, res: any, next: Function): void => {
  const hasStatus = !_.isUndefined(res.locals.status);
  const hasBody = !_.isUndefined(res.locals.body);

  // Set the status code.
  if (hasStatus) {
    res.status(res.locals.status);
  }

  if (hasBody) {
    // Include the version metadata property.
    res.locals.body.meta = res.locals.body.meta || {};
    res.locals.body.meta.version = req.version;

    // Add Access-Control-Allow-Methods based on the allowed property in the
    // response body.
    if (req.method === 'OPTIONS' && typeof res.locals.body.meta.allowed === 'string') {
      res.set('Access-Control-Allow-Methods', res.locals.body.meta.allowed);
    }

    // Send response body.
    res.send(res.locals.body);
  }
  else if (hasStatus) {
    // End requests with a status but no body.
    res.end();
  }
  else {
    // Pass unhandled requests to the error handler.
    next(createError(404, 'Not Found'));
  }
};
