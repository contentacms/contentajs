// @flow

const _ = require('lodash');
const config = require('config');
const logger = require('pino')();
const fallbackToCms = require('./fallbackToCms');
const { redisGet } = require('../caching/drupalRedis')(
  _.get(process, 'env.redisPrefix', ''),
  _.get(process, 'env.redisCidTemplate', ''),
  config.get('redis.pool')
);

/**
 * Tries to load an API request to the CMS from cache then from the CMS.
 *
 * If the request is not present/valid in the cache, then it's when we bother
 * the CMS with the request.
 */
module.exports = (req: any, res: any, next: Function): void => {
  redisGet(`${req.cmsHost}${req.originalUrl}:html`)
    .then(cached => {
      if (!cached) {
        fallbackToCms(req, res, next);
        return;
      }
      res.send(cached);
    })
    .catch(error => {
      // If there is an error getting the cache entry, fallback to the CMS.
      logger.error(error);
      fallbackToCms(req, res, next);
    });
};
