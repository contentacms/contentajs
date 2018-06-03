const CmsMetaLoader = require('./CmsMetaLoader');

describe('The generic CMS Meta loader', () => {
  test('It exports the fetch function', () => {
    expect.assertions(2);
    const manager = {
      get: jest.fn().mockReturnValue({ rpcMethod: 'foo' }),
      check: jest.fn(),
    };
    const sut = new CmsMetaLoader(manager, 'the-id');
    const requestor = { execute: jest.fn() };
    const actual = sut.exportSync({ requestor }).fetch;
    expect(actual).toEqual(expect.any(Function));
    actual();
    expect(requestor.execute).toHaveBeenCalledWith({
      id: 'req-foo',
      jsonrpc: '2.0',
      method: 'foo',
    });
  });
  test('It fails without an rpcMethod', () => {
    expect.assertions(1);
    const manager = {
      get: jest.fn().mockReturnValue({}),
      check: jest.fn(),
    };
    const sut = new CmsMetaLoader(manager, 'the-id');
    expect(() =>
      sut.exportSync({ requestor: {} })
    ).toThrowErrorMatchingSnapshot();
  });
});
