const cacheControl = require('./cacheControl');
const { Request } = require('jest-express/lib/request');
const { Response } = require('jest-express/lib/response');

describe('The cache control middleware', () => {
  let req;
  let res;

  beforeEach(() => {
    req = new Request();
    res = new Response();
  });

  afterEach(() => {
    req.resetMocked();
    res.resetMocked();
  });

  test('It can set the appropriate headers: GET', () => {
    expect.assertions(2);
    req.method = 'GET';
    req.url = '/api/foo/1';
    const next = jest.fn();
    cacheControl(req, res, next);
    expect(res.set).toHaveBeenLastCalledWith(
      'Cache-Control',
      'public, max-age=900'
    );
    expect(next).toHaveBeenCalled();
  });

  test('It can set the appropriate headers: GET (subroute)', () => {
    expect.assertions(2);
    req.method = 'GET';
    req.url = '/api/bar/2';
    const next = jest.fn();
    cacheControl(req, res, next);
    expect(res.set).toHaveBeenLastCalledWith(
      'Cache-Control',
      'public, max-age=1500'
    );
    expect(next).toHaveBeenCalled();
  });

  test('It can set the appropriate headers: OPTIONS', () => {
    expect.assertions(2);
    req.method = 'OPTIONS';
    req.url = '/api/lorem';
    const next = jest.fn();
    cacheControl(req, res, next);
    expect(res.set).toHaveBeenLastCalledWith(
      'Cache-Control',
      'public, max-age=86400'
    );
    expect(next).toHaveBeenCalled();
  });

  test("It won't set any headers: POST", () => {
    expect.assertions(2);
    req.method = 'POSY';
    req.url = '/api/lorem';
    const next = jest.fn();
    cacheControl(req, res, next);
    expect(res.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
