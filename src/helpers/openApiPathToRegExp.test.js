const openApiPathToRegExp = require('./openApiPathToRegExp');

describe('openApiPathToRegExp', () => {
  test('It can transform paths', () => {
    expect.assertions(1);
    const paths = ['/foo', '/foo/{bar}', '/foo/{bar}/oof/{baz}'];
    const actual = openApiPathToRegExp(paths);
    const expected = [
      '^\\/foo/?$',
      '^\\/foo/[^\\/]+/?$',
      '^\\/foo/[^\\/]+/oof/[^\\/]+/?$',
    ];
    expect(actual).toEqual(expected);
  });
});
