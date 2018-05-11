// @flow

const Redis = require('ioredis');

/**
 * Interacts with the Redis cache via a connection pool transparently.
 */
class Cache {
  // TODO: Type redisOptions as RedisOptions | ClusterOptions.
  // TODO: Type poolOptions manually.
  constructor(redisHost: string, redisOptions: any, poolOptions: any) {
    throw new Error('TODO: Implement this!');
    // Decorate all the commands with an acquire / release pattern.
    pool[0].getBuiltinCommands().forEach((command: string) => {
      let connection;
      // Attach a method to this object for each Redis command. Each method will
      // 1. get a connection from the pool, 2. execute the command, 3. release
      // the connection from the pool.
      this[command] = (...args) => this.acquire()
        .then((resource: Redis) => {
          connection = resource;
        })
        .then(() => connection[command](...args))
        .then((res) => {
          this.release(connection);
          return res;
        })
        .catch(error => {
          this.release(connection);
          throw error;
        });
    });
  }

  /**
   * Acquire a Redis connection.
   *
   * @return {Promise<Redis>}
   *   The promise of a connection.
   */
  acquire(): Promise<Redis> {
    throw new Error('TODO: Implement this!');
  }

  /**
   * Release the connection to put it back in the connection pool.
   *
   * @param {Redis} resource
   *   The resource to release.
   */
  release(resource: Redis): Promise<void> {
    throw new Error('TODO: Implement this!');
  }
}

module.exports = Cache;
