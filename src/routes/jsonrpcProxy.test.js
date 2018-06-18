const jsonrpcProxy = require('./jsonrpcProxy');

jest.mock('express-http-proxy');

const proxy = require('express-http-proxy');

describe('The jsonrpcProxy route', () => {
  test('It responds', () => {
    expect.assertions(2);
    const req = { cmsHost: 'lorem', url: '/ipsum' };
    jsonrpcProxy(req);
    expect(proxy).toHaveBeenCalled();
    const { proxyReqPathResolver } = proxy.mock.calls[0][1];
    const actual = proxyReqPathResolver(req);
    expect(actual).toBe('/jsonrpc/ipsum');
  });
});
