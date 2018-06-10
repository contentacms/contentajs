// @flow

import type { $Request as Request, $Response as Response } from 'express';

/**
 * A healthcheck endpoint.
 *
 * Useful for auto-scaling policies, like EC2.
 */
module.exports = (req: Request, res: Response): void => {
  res.set('Cache-Control', 'private, max-age=0, no-cache');
  res.json({ meta: { healthcheck: 'good' } });
};
