const ourGot = require('./got');

jest.mock('got');
jest.mock('keyv');

describe('Our got helper', () => {
  test('can provide defaults to got', () => {
    expect.assertions(6);

    const got = require('got');
    const url = 'foo';
    ourGot(url);
    expect(got).toHaveBeenCalled();
    const calledUrl = got.mock.calls[0][0];
    expect(calledUrl).toBe(url);
    const usedOptions = got.mock.calls[0][1];
    expect(usedOptions.cache).not.toBeUndefined();
    expect(usedOptions.json).toBe(true);
    expect(usedOptions.json).toBe(true);
    expect(usedOptions.headers['user-agent']).not.toBeUndefined();
  });
});
