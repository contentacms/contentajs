// @flow

const config = require('config');

/**
 * A custom implementation of CORS.
 */
module.exports = (req: any, res: any, next: Function): void => {
  // Enable CORS.
  res.set('Access-Control-Allow-Origin', '*');
  res.set(
    'Access-Control-Allow-Headers',
    config.get('cors.headers').join(', ')
  );
  next();
};
