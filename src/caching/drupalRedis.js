// @flow

import type { CacheEntry } from '../../types/drupalRedis';
import type { GenericPoolOptions } from '../../types/generic-pool';

const _ = require('lodash');
const config = require('config');

// I am not convinced that Drupal's Redis integration supports clustering. So
// until that happens we don't need to bother ourselves with clustering in here.
const Cache = require('./Cache');

let drupalCache: ?Cache;
const init = (prefix: string, poolOptions: GenericPoolOptions): Cache => {
  const redisOptions: { [string]: any } = config.util.toObject(
    config.get('redis.options')
  );
  redisOptions.keyPrefix = prefix;
  const redisHost: string = config.get('redis.host');
  drupalCache = new Cache(redisHost, redisOptions, poolOptions);
  return drupalCache;
};

/**
 * Generates the Redis cid based on the cache cid.
 *
 * @param {string} cid
 *   The cache ID to prefix.
 * @param {string} bin
 *   The cache bin this entry is stored in.
 * @param {string} template
 *   The cache ID template to replace.
 *
 * @return {string}
 *   The cache ID in Redis.
 */
const generateCid = (cid: string, bin: string, template: string): string =>
  template.replace('{bin}', bin).replace('{cid}', cid);

/**
 * Checks if the existing cache entry is still valid to use.
 *
 * Uses the valid flag, the expire field and requests the cache tags to make
 * sure they haven't been expired.
 *
 * @param {CacheEntry} cached
 *   The cache entry to check.
 * @param {string} template
 *   The cache ID template to replace.
 * @param {Cache} instance
 *   The Cache client.
 *
 * @return {Promise<boolean>}
 *   TRUE if it's valid. FALSE otherwise.
 */
const isValidCacheEntry = (
  cached: CacheEntry,
  template: string,
  instance: Cache
): Promise<boolean> => {
  // Inspect the cache object to make sure it's valid.
  if (
    cached.cid.length === 0 ||
    !cached.valid ||
    (parseInt(cached.expire, 10) !== -1 && cached.expire < Date.now() / 1000)
  ) {
    return Promise.resolve(false);
  }
  // Now validate the cache tags.
  const tags = cached.tags.split(' ');
  // Do not use 'mget' since that is not a cluster-friendly operation.
  const cacheIds = tags.map(tag => generateCid(tag, 'cachetags', template));
  return (
    instance
      .execute('mget', cacheIds)
      // Remove all the empty responses.
      .then(tagsData => tagsData.filter(i => i))
      // Calculate the checksum by adding the results.
      .then(tagsData =>
        tagsData.reduce((carry, item) => carry + parseInt(item, 10), 0)
      )
      .then(
        computedChecksum => parseInt(cached.checksum, 10) === computedChecksum
      )
  );
};

module.exports = (
  prefix: string,
  template: string,
  poolOptions: GenericPoolOptions
): { redisGet: Function, redis: Cache } => {
  const instance = !drupalCache ? init(prefix, poolOptions) : drupalCache;
  return {
    redisGet(cid: string) {
      // Generate the cache ID based on the metadata extracted from the CMS.
      const newCid = generateCid(cid, 'page', template);
      // The cache entry contains meta information and data. All is stored
      // together in a Redis hash.
      return instance.execute('hgetall', newCid).then((res: CacheEntry) => {
        if (!res || !Object.keys(res).length) {
          return Promise.resolve();
        }
        // Uses all the cache entry metadata (valid flag, expiration, and cache
        // tags to decide if the cache entry can be used or not.
        return !isValidCacheEntry(res, template, instance).then(isValid => {
          if (!isValid) {
            return Promise.resolve();
          }
          // Cache entries coming from Drupal are PHP-serialized responses. This
          // regular expression will extract the response data from there. This
          // is sad, but there is nothing we can do.
          const content = _.get(res, 'data', '').replace(
            /(.*"\0\*\0content";s:\d+:")([^\0]+)([^\\])";.*/,
            '$2$3'
          );
          return JSON.parse(content);
        });
      });
    },
    redis: instance,
  };
};
