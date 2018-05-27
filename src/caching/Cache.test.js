jest.mock('ioredis');
const ioredis = require('ioredis');
const Cache = require('./Cache');

describe('The cache layer', () => {
  let cache;

  beforeEach(() => {
    cache = new Cache('redis://foo', {}, {});
    jest.resetAllMocks();
  });

  test('is able to execute commands in Redis', done => {
    expect.assertions(3);
    jest.spyOn(cache.pool, 'release');
    return cache.execute('get', 'lorem', 'ipsum').then(() => {
      expect(ioredis).toHaveBeenCalledWith('redis://foo', {});
      expect(ioredis.prototype.get).toHaveBeenCalledWith('lorem', 'ipsum');
      // Run after next tick so we can ensure release has been called.
      process.nextTick(() => {
        expect(cache.pool.release).toHaveBeenCalled();
        done();
      });
    });
  });

  test('is able to disconnect from Redis', () => {
    expect.assertions(1);
    let resource;
    return cache
      .acquire()
      .then(res => {
        resource = res;
        jest.spyOn(resource, 'disconnect');
        return cache.destroy(resource);
      })
      .then(() => {
        expect(resource.disconnect).toHaveBeenCalled();
      });
  });

  test('can catch exceptions to release the resource', done => {
    expect.assertions(3);
    jest.spyOn(cache.pool, 'release');
    ioredis.prototype.get.mockImplementation(() => {
      throw new Error('My custom error');
    });
    return cache.execute('get', 'lorem', 'ipsum').catch(() => {
      expect(ioredis).toHaveBeenCalledWith('redis://foo', {});
      expect(ioredis.prototype.get).toHaveBeenCalledWith('lorem', 'ipsum');
      // Run after next tick so we can ensure release has been called.
      process.nextTick(() => {
        expect(cache.pool.release).toHaveBeenCalled();
        done();
      });
    });
  });
});
