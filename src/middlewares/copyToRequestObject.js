// @flow

import type { ObjectLiteral } from '../../flow/types/common';

/**
 * Returns a middleware that will copy all of the properties to the request.
 *
 * This is useful to store variables that will be used in any arbitrary
 * middleware down the process.
 */
module.exports = (args: ObjectLiteral) => (
  req: any,
  res: any,
  next: Function
): void => {
  Object.keys(args).forEach(key => {
    req[key] = args[key];
  });
  next();
};
