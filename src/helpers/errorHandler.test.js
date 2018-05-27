const errorHandler = require('./errorHandler');
const { Request } = require('jest-express/lib/request');
const { Response } = require('jest-express/lib/response');

jest.mock('pino', () => {
  const error = jest.fn();
  const mock = () => ({ error });
  mock.error = error;
  return mock;
});

const pino = require('pino');

describe('The API error handler', () => {
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

  test('It can process an error object', () => {
    expect.assertions(4);
    const next = jest.fn();
    errorHandler(new Error('foo'), req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith(
      'Cache-Control',
      'private, max-age=0, no-cache'
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(pino.error).toHaveBeenCalled();
  });

  test('It can process an error array', () => {
    expect.assertions(4);
    const next = jest.fn();
    const errors = [
      {
        status: 999,
        message: 'sid',
      },
    ];
    errorHandler(errors, req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith(
      'Cache-Control',
      'private, max-age=0, no-cache'
    );
    expect(res.status).toHaveBeenCalledWith(999);
    expect(res.json).toHaveBeenLastCalledWith({
      errors: [
        {
          status: 999,
          title: 'sid',
        },
      ],
    });
  });

  test('It can process an error with timeout', () => {
    expect.assertions(4);
    const next = jest.fn();
    const error = {
      status: 876,
      name: 'dolor',
      message: 'sid',
      timeout: 34567,
    };
    req.timedout = true;
    errorHandler(error, req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.set).toHaveBeenLastCalledWith('Retry-After', 1200);
    expect(res.status).toHaveBeenCalledWith(876);
    expect(res.json).toHaveBeenLastCalledWith({
      errors: [
        {
          code: 'dolor',
          status: 876,
          title: 'Response time exceeded 34.567 second(s).',
        },
      ],
    });
  });
});
