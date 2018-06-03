const proxyHandler = require('./proxyHandler');
const { Request } = require('jest-express/lib/request');
const { Response } = require('jest-express/lib/response');

jest.mock('express-http-proxy', () =>
  jest.fn().mockImplementation(() => jest.fn())
);
jest.mock('../middlewares/errorHandler');
jest.mock('pino', () => {
  const warn = jest.fn();
  const mock = () => ({ warn });
  mock.warn = warn;
  return mock;
});

const pino = require('pino');

const proxy = require('express-http-proxy');
const errorHandler = require('../middlewares/errorHandler');

describe('The fallback to CMS', () => {
  let req;
  let res;

  beforeEach(() => {
    req = new Request();
    req.cmsHost = 'foo';
    req.jsonApiPrefix = 'lorem';
    res = new Response();
  });

  afterEach(() => {
    req.resetMocked();
    res.resetMocked();
  });

  test('It can execute the proxy', () => {
    expect.assertions(3);
    const next = jest.fn();
    proxyHandler(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(proxy.mock.calls[0][0]).toBe('foo');
    expect(Object.keys(proxy.mock.calls[0][1])).toEqual([
      'proxyReqPathResolver',
      'proxyReqBodyDecorator',
      'proxyErrorHandler',
      'userResHeaderDecorator',
    ]);
  });

  test('the proxyReqPathResolver', () => {
    expect.assertions(1);
    proxyHandler(req, res);
    const { proxyReqPathResolver } = proxy.mock.calls[0][1];
    const rq = new Request();
    rq.url = 'http://localhost:42345/bibidi/babidi/boo';
    const actual = proxyReqPathResolver(rq);
    expect(actual).toBe('lorem/bibidi/babidi/boo');
  });

  test('the proxyReqBodyDecorator', () => {
    expect.assertions(4);
    proxyHandler(req, res);
    const { proxyReqBodyDecorator } = proxy.mock.calls[0][1];
    let srcReq = new Request();
    srcReq.method = 'TRACE';
    let actual = proxyReqBodyDecorator(null, srcReq);
    expect(actual).toBe('');
    srcReq = new Request();
    srcReq.headers = {};
    srcReq.method = 'PUT';
    actual = proxyReqBodyDecorator(null, srcReq);
    expect(actual).toBe('');
    expect(pino.warn).toHaveBeenCalledWith(
      'The request body was ignored because the Content-Type header is not present.'
    );
    srcReq = new Request();
    srcReq.headers = { 'content-type': 'fake' };
    srcReq.method = 'PUT';
    actual = proxyReqBodyDecorator('random!', srcReq);
    expect(actual).toBe('random!');
  });

  test('the proxyErrorHandler', () => {
    expect.assertions(1);
    proxyHandler(req, res);
    const { proxyErrorHandler } = proxy.mock.calls[0][1];
    proxyErrorHandler();
    expect(errorHandler).toHaveBeenCalled();
  });

  test('the userResHeaderDecorator', () => {
    expect.assertions(1);
    proxyHandler(req, res);
    const { userResHeaderDecorator } = proxy.mock.calls[0][1];
    req.method = 'GET';
    req.url = 'meh...';
    const actual = userResHeaderDecorator({ foo: 'bar' }, req);
    expect(actual).toEqual({
      'Cache-Control': 'public, max-age=900',
      foo: 'bar',
    });
  });
});
