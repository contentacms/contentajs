const customCors = require('./customCors');

describe('CORS', () => {
  test('It generates the correct headers', () => {
    expect.assertions(3);
    const next = jest.fn();
    const res = {
      set: jest.fn(),
    };
    customCors(null, res, next);
    expect(res.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    expect(res.set).toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'Lorem, Foo'
    );
    expect(next).toHaveBeenCalled();
  });
});
