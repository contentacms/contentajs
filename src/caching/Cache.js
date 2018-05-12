// @flow

import type { Pool } from 'generic-pool';
import type { GenericPoolOptions } from '../../types/generic-pool';

const _ = require('lodash');
const Redis = require('ioredis');
const { createPool }= require('generic-pool');
let commands: Array<string> = require('redis-commands').list;

// Make some alterations to the list of commands.
commands = _.difference(commands, ['monitor']);
commands.push('sentinel');

/**
 * Interacts with the Redis cache via a connection pool transparently.
 */
class Cache {
  /**
   * The pool of connections.
   */
  pool: Pool;

  /**
   * Constructs a cache object.
   *
   * @param {string} redisHost
   *   The redis host with the redis:// form.
   * @param {Object} redisOptions
   *   The options to be passed to ioredis.
   * @param {GenericPoolOptions} poolOptions
   *   The options to be passed to generic-pool.
   */
  constructor(redisHost: string, redisOptions: {[string]: any}, poolOptions: GenericPoolOptions) {
    const factory = {
      create: () => new Redis(redisHost, redisOptions),
      destroy: (connection: Redis) => connection.disconnect(),
    };
    this.pool = createPool(factory, poolOptions);
  }

  /**
   * Acquire a Redis connection.
   *
   * @param {number} priority
   *   The priority to acquire from the queued requests.
   *
   * @return {Promise<Redis>}
   *   The promise of a connection.
   */
  acquire(priority: ?number): Promise<Redis> {
    return this.pool.acquire(priority);
  }

  /**
   * Release the connection to put it back in the connection pool.
   *
   * @param {Redis} resource
   *   The resource to release.
   *
   * @return {Promise<void>}
   *   Resolves when the resource is released.
   */
  release(resource: Redis): Promise<void> {
    return this.pool.release(resource);
  }

  /**
   * Release the connection back to the connection pool and disconnect.
   *
   * @param {Redis} resource
   *   The resource to release.
   *
   * @return {Promise<void>}
   *   Resolves when the resource is released.
   */
  destroy(resource: Redis): Promise<void> {
    return this.pool.destroy(resource);
  }

  /**
   * Execute a Redis command.
   *
   * @param {string} command
   *   The command name.
   * @param {Array<*>} args
   *   The arguments for the command.
   *
   * @return {Promise<*>}
   *   The result of the command.
   */
  execute(command: string, ...args: Array<*>) {
    // 1. get a connection from the pool, 2. execute the command, 3. release
    // the connection from the pool.
    let connection: Redis;
    // 1. Acquire the connection from the pool.
    return this.acquire()
      .then((resource: Redis) => {
        // Save to a local variable for later use.
        connection = resource;
      })
      // 2. Execute the command on the acquired connection.
      .then(() => connection[command](...args))
      // 3. Release the connection in the next tick and return the result
      .then((res) => {
        process.nextTick(() => this.release(connection));
        return res;
      })
      // Release the connection, then re-throw the error.
      .catch(error => this.release(connection).then(() => {
        throw error;
      }));
  }
}

module.exports = Cache;
