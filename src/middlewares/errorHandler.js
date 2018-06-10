// @flow

import type {
  $Request as Request,
  $Response as Response,
  NextFunction,
} from 'express';

const _ = require('lodash');
const config = require('config');
const logger = require('pino')();

module.exports = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction // eslint-disable-line no-unused-vars
): void => {
  const errors = Array.isArray(err) ? err : [err];
  res.set('Cache-Control', 'private, max-age=0, no-cache');
  res.status(errors[0].status || 500);

  const errorObjects = _.map(errors, error => {
    let eObject: { [string]: any } = {
      status: 500,
      code: 'InternalServerError',
      title: 'Internal server error.',
    };

    if (error.status) {
      if (req.timedout) {
        res.set('Retry-After', config.get('timeout.retryAfter'));
        error.message = `Response time exceeded ${error.timeout /
          1000} second(s).`;
      }

      eObject = _.merge(
        eObject,
        _.pick(error, ['status', 'links', 'detail', 'source', 'meta'])
      );
      eObject.code = error.name;
      eObject.title = error.message;
    }
    // These are unexpected, non HTTP errors.
    else {
      eObject.detail = `${error.name}: ${error.message}`;
    }
    // Log in detail.
    logger.error({
      request: {
        url: req.url,
        body: req.body,
      },
      error: {
        code: err.status,
        stack: err.stack,
      },
    });
    return eObject;
  });

  res.json({ errors: errorObjects });
};
