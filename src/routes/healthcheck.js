// @flow

/**
 * A healthcheck endpoint.
 *
 * Useful for auto-scaling policies, like EC2.
 */
module.exports = (req: any, res: any): void => {
  res.set('Cache-Control', 'private, max-age=0, no-cache');
  res.json({ meta: { healthcheck: 'good' } });
};
