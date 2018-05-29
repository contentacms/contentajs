// @flow

const { initSubrequests, processor } = require('./subrequests');

jest.mock('subrequests-express', () => ({
  subrequestsRouterFactory: jest.fn().mockImplementation(() => 'mocked'),
}));

describe('The request aggregator initializer', () => {
  test('It adds the route handlers', () => {
    expect.assertions(2);
    const app = {
      use: jest.fn(),
      all: jest.fn(),
    };
    initSubrequests(app);
    expect(app.all).toHaveBeenCalledWith('/subrequests', processor);
    expect(app.use).toHaveBeenCalledWith('mocked');
  });

  test('The request processor middleware', () => {
    expect.assertions(3);
    const res = { set: jest.fn() };
    const next = jest.fn();
    const req = {};
    processor(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith(
      'Cache-Control',
      'private, max-age=0, no-cache'
    );
    expect(req.subrequestsResponseMerger).not.toBeUndefined();
  });

  test('The request processor middleware multipart', () => {
    expect.assertions(3);
    const config = require('config');
    jest.spyOn(config, 'get').mockImplementation(() => 'multipart');
    const res = { set: jest.fn() };
    const next = jest.fn();
    const req = {};
    processor(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith(
      'Cache-Control',
      'private, max-age=0, no-cache'
    );
    expect(req.subrequestsResponseMerger).toBeUndefined();
  });
});
