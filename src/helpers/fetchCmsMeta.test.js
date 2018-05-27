const fetchCmsMeta = require('./fetchCmsMeta');

jest.mock('./jsonrpc', () => {
  const mock = () => ({
    init() {
      return Promise.resolve({ execute: mock.execute });
    },
  });
  mock.execute = jest.fn().mockImplementation(() => Promise.resolve());
  return mock;
});
jest.mock('keyv');

describe('The metadata bootstrap process', () => {
  test('It requests the correct data', () => {
    expect.assertions(1);
    const jsonrpc = require('./jsonrpc');
    return fetchCmsMeta().then(() => {
      expect(jsonrpc.execute).toHaveBeenCalledWith([
        {
          jsonrpc: '2.0',
          method: 'jsonapi.metadata',
          id: 'cms-meta',
        },
        {
          jsonrpc: '2.0',
          method: 'redis.metadata',
          id: 'redis-meta',
        },
      ]);
    });
  });
});
