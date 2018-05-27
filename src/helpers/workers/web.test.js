const Adios = require('adios');

describe('The web worker', () => {
  test('Initializes with the adios socket', () => {
    expect.assertions(2);
    let shutdown;
    jest.spyOn(Adios.child, 'init').mockImplementation(cb => {
      shutdown = cb;
    });
    const server = require('./web');
    expect(server.listening).toBe(true);
    return shutdown().then(() => {
      expect(server.listening).toBe(false);
    });
  });
});
