const fetchCmsMeta = require('./fetchCmsMeta');

jest.mock('./jsonrpc', () => {
  const mock = () => ({
    init() {
      return Promise.resolve({ execute: mock.execute });
    },
  });
  mock.execute = jest.fn();
  return mock;
});
jest.mock('keyv');
jest.mock('pino', () => {
  const error = jest.fn();
  const mock = () => ({ error });
  mock.error = error;
  return mock;
});

const pino = require('pino');

describe('The metadata bootstrap process', () => {
  test('It requests the correct data', () => {
    expect.assertions(1);
    const jsonrpc = require('./jsonrpc');
    jsonrpc.execute.mockImplementationOnce(() =>
      Promise.resolve({
        result: {
          openApi: {
            basePath: '/foo',
            paths: { lorem: 'ipsum' },
          },
        },
      })
    );
    return fetchCmsMeta().then(() => {
      expect(jsonrpc.execute).toHaveBeenCalledWith([
        {
          id: 'req-jsonapi.metadata',
          jsonrpc: '2.0',
          method: 'jsonapi.metadata',
        },
      ]);
    });
  });
  test('It swallows the errors', () => {
    expect.assertions(1);
    const jsonrpc = require('./jsonrpc');
    jsonrpc.execute.mockImplementationOnce(() => Promise.reject('Womp womp!'));
    return fetchCmsMeta().then(() => {
      expect(pino.error).toHaveBeenCalledWith('Womp womp!');
    });
  });
});
