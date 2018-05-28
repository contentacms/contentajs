const proxyHandler = require('./proxyHandler');

jest.mock('../middlewares/fallbackToCms');
jest.mock('../caching/drupalRedis', () => () => ({
  redisGet(uri) {
    switch (uri) {
      case '1:html':
        return Promise.resolve('Foo!');
      case 'error:html':
        return Promise.reject(new Error('Booh!'));
      default:
        return Promise.resolve();
    }
  },
}));
jest.mock('pino', () => {
  const error = jest.fn();
  const mock = () => ({ error });
  mock.error = error;
  return mock;
});

const pino = require('pino');
describe('The proxy middleware', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('It can respond from cache', done => {
    expect.assertions(2);
    const next = jest.fn();
    const fakeRes = {
      send(body) {
        expect(body).toBe('Foo!');
        expect(next).not.toHaveBeenCalled();
        done();
      },
    };
    proxyHandler({ cmsHost: '', originalUrl: '1' }, fakeRes, next);
  });

  describe('It can fall back to the CMS', () => {
    let fallbackToCms;

    beforeEach(() => {
      fallbackToCms = require('../middlewares/fallbackToCms');
    });

    test('It falls back on cache miss', done => {
      expect.assertions(1);
      const next = jest.fn();
      fallbackToCms.mockImplementation(() => {
        expect(fallbackToCms).toHaveBeenCalled();
        done();
      });
      proxyHandler({}, {}, next);
    });

    test('It falls back on cache error', done => {
      expect.assertions(2);
      const next = jest.fn();
      fallbackToCms.mockImplementation(() => {
        expect(fallbackToCms).toHaveBeenCalled();
        expect(pino.error).toHaveBeenCalledWith(new Error('Booh!'));
        done();
      });
      proxyHandler({ cmsHost: '', originalUrl: 'error' }, {}, next);
    });
  });
});
