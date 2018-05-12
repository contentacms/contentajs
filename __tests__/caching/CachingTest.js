jest.mock('ioredis');
const ioredis = require('ioredis');
const Cache = require('../../lib/caching/Cache');

describe('The cache layer', () => {
  let cache;

  beforeEach(() => {
    cache = new Cache('redis://foo', {}, {});
    jest.resetAllMocks();
  });

  it('is able to execute commands in Redis', (done) => {
    expect.assertions(3);
    jest.spyOn(cache.pool, 'release');
    cache.execute('get', 'lorem', 'ipsum')
      .then(() => {
        expect(ioredis).toHaveBeenCalledWith('redis://foo', {});
        expect(ioredis.prototype.get).toHaveBeenCalledWith('lorem', 'ipsum');
        // Run after next tick so we can ensure release has been called.
        process.nextTick(() => {
          expect(cache.pool.release).toHaveBeenCalled();
          done();
        });
      });
  });

  it('is able to disconnect from Redis', () => {
    expect.assertions(1);
    let resource;
    return cache.acquire()
      .then(res => {
        resource = res;
        jest.spyOn(resource, 'disconnect');
        return cache.destroy(resource);
      })
      .then(() => {
        expect(resource.disconnect).toHaveBeenCalled();
      });
  });

  it('can catch exceptions to release the resource', (done) => {
    expect.assertions(3);
    jest.spyOn(cache.pool, 'release');
    ioredis.prototype.get.mockImplementation(() => {
      throw new Error('My custom error');
    });
    cache.execute('get', 'lorem', 'ipsum')
      .catch(() => {
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
