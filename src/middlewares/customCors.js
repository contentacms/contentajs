// @flow

import type {
  $Request as Request,
  $Response as Response,
  NextFunction,
} from 'express';

const config = require('config');

/**
 * A custom implementation of CORS.
 */
module.exports = (req: Request, res: Response, next: NextFunction): void => {
  // Enable CORS.
  res.set('Access-Control-Allow-Origin', '*');
  res.set(
    'Access-Control-Allow-Headers',
    config.get('cors.headers').join(', ')
  );
  next();
};
