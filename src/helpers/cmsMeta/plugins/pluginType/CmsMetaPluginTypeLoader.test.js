const CmsMetaPluginTypeLoader = require('./CmsMetaPluginTypeLoader');

describe('The CMS Meta plugin type', () => {
  test('It defines the correct properties', () => {
    expect.assertions(1);
    const manager = {
      get: jest.fn().mockReturnValue({}),
      check: jest.fn(),
    };
    const sut = new CmsMetaPluginTypeLoader(manager, 'the-id');
    expect(sut.definePluginProperties()).toEqual(['fetch']);
  });
});
