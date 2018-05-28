// @flow

const copyToRequestObject = require('./copyToRequestObject');

describe('The set up process', () => {
  test('It can copy variables', () => {
    expect.assertions(2);
    const req = {};
    const next = jest.fn();
    copyToRequestObject({ foo: 'bar' })(req, null, next);
    expect(req.foo).toBe('bar');
    expect(next).toHaveBeenCalled();
  });
});
