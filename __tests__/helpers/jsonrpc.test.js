jest.mock('got');
const got = require('got');

got.mockImplementation((url, options) => {
  const resFromObj = obj =>
    Promise.resolve({ body: Buffer.from(JSON.stringify(obj)) });
  switch (url) {
    case 'foo/jsonrpc/methods':
      return resFromObj({ data: [{ id: 'lorem' }, { id: 'broken' }] });
    case 'foo/jsonrpc':
      switch (options.body.method) {
        case 'lorem':
          return resFromObj({ result: { foo: 'bar' } });
        case 'broken':
          return resFromObj({ error: { code: 1, message: 'Booh!' } });
        default:
          return resFromObj('');
      }
    default:
      return resFromObj('');
  }
});

const jsonrpc = require('../../lib/helpers/jsonrpc')('foo');

describe('The JSON RPC 2.0 requestor', () => {
  it('should initialize correctly', () => {
    expect.assertions(2);
    return jsonrpc.init().then(requestor => {
      expect(requestor).toBeInstanceOf(jsonrpc.ContentaJsonRpc);
      expect(requestor.methods).toEqual(['lorem', 'broken']);
    });
  });
  it('should execute valid methods', () => {
    expect.assertions(1);
    return jsonrpc
      .init()
      .then(requestor => requestor.execute({ method: 'lorem' }))
      .then(res => {
        expect(res).toEqual({ result: { foo: 'bar' } });
      });
  });
  it('should reject invalid methods', () => {
    expect.assertions(1);
    return jsonrpc
      .init('foo')
      .then(requestor => requestor.execute({ method: 'missing-method' }))
      .catch(err => {
        expect(JSON.parse(err.message)).toEqual({
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: 'Method not found',
          },
        });
      });
  });
  it('should reject backend failures', () => {
    expect.assertions(1);
    return jsonrpc
      .init('foo')
      .then(requestor => requestor.execute({ method: 'broken' }))
      .catch(err => {
        expect(JSON.parse(err.message)).toEqual({
          error: {
            code: 1,
            message: 'Booh!',
          },
        });
      });
  });
});
