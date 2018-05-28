const healthcheck = require('./healthcheck');

describe('The healthcheck route', () => {
  test('It responds', () => {
    expect.assertions(2);
    const res = {
      set: jest.fn(),
      json: jest.fn(),
    };
    healthcheck(null, res);
    expect(res.set).toHaveBeenCalledWith(
      'Cache-Control',
      'private, max-age=0, no-cache'
    );
    expect(res.json).toHaveBeenCalledWith({
      meta: {
        healthcheck: 'good',
      },
    });
  });
});
