const Cache = require('./Cache');
const drupalRedis = require('./drupalRedis');
const { redisGet, redis } = drupalRedis('foo:bar:baz:', '@{bin}#{cid}@', {
  max: 30,
});

describe('The integration with the Drupal usage of Redis', () => {
  beforeAll(() => {
    redis.execute = jest.fn().mockImplementation((command, ...args) => {
      if (command === 'hgetall') {
        switch (args[0]) {
          case '@page#missing@':
            return Promise.resolve({});
          case '@page#undefined@':
            return Promise.resolve();
          case '@page#invalid@':
            return Promise.resolve({
              valid: 0,
              cid: args[0],
            });
          case '@page#invalid2@':
            return Promise.resolve({
              valid: 1,
              cid: '',
            });
          case '@page#expired@':
            return Promise.resolve({
              valid: 1,
              cid: args[0],
              expire: 0,
            });
          case '@page#no-tags@':
            return Promise.resolve({
              valid: 1,
              cid: args[0],
              expire: Date.now() + 1000000,
              tags: 'x-redis-bin:config',
              checksum: 0,
              data:
                'O:35:"Drupal\\Core\\Cache\\CacheableResponse":7"\0*\0content";s:14:"{"true": true}";s:10:"\0*\0version";',
            });
          case '@page#invalidated-tags@':
            return Promise.resolve({
              valid: 1,
              cid: args[0],
              expire: Date.now() + 1000000,
              tags: 'x-redis-bin:config inv',
              checksum: 0,
              data:
                'O:35:"Drupal\\Core\\Cache\\CacheableResponse":7"\0*\0content";s:14:"{"true": true}";s:10:"\0*\0version";',
            });
          default:
            return Promise.resolve();
        }
      } else if (command === 'mget') {
        return Promise.all(
          args[0].map(tag => {
            switch (tag) {
              case '@cachetags#inv@':
                return '2';
            }
            return '0';
          })
        );
      }
    });
  });
  test('It can be initialized', () => {
    expect.assertions(1);
    expect(redis).toBeInstanceOf(Cache);
  });
  test('It is not reinitialized', () => {
    expect.assertions(1);
    const out = drupalRedis('foo:bar:baz:', '@{bin}#{cid}@', {
      max: 99,
    });
    expect(out.redis.pool._config.max).toBe(30);
  });
  test('It can get a response from a missing page cache', () => {
    return redisGet('missing')
      .then(res => {
        expect(res).toBeUndefined();
        return redisGet('undefined');
      })
      .then(res => {
        expect(res).toBeUndefined();
      });
  });
  test('It can get an invalid response', () => {
    return redisGet('invalid')
      .then(res => {
        expect(res).toBeUndefined();
        return redisGet('invalid2');
      })
      .then(res => {
        expect(res).toBeUndefined();
        return redisGet('expired');
      })
      .then(res => {
        expect(res).toBeUndefined();
      });
  });
  test('It can get an valid response', () => {
    return redisGet('no-tags').then(res => {
      expect(res).toEqual({ true: true });
    });
  });
  test('It can get an invalidated response', () => {
    return redisGet('invalidated-tags').then(res => {
      expect(res).toBeUndefined();
    });
  });
});
