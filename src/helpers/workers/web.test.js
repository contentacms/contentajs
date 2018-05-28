jest.mock('pino', () => {
  const info = jest.fn();
  const output = () => ({ info });
  output.info = info;
  return output;
});

const pino = require('pino');

describe('The web worker', () => {
  test('Initializes with the adios socket', () => {
    expect.assertions(4);
    let shutdown;
    const Adios = require('adios');
    jest.spyOn(Adios.child, 'init').mockImplementation(cb => {
      shutdown = cb;
    });
    const server = require('./web');
    expect(server.listening).toBe(true);
    return shutdown().then(() => {
      expect(server.listening).toBe(false);
      expect(pino.info.mock.calls[0][0]).toBe(
        'Shutting down server for web worker %s.'
      );
      expect(pino.info.mock.calls[1][0]).toBe(
        'Server for web worker %s shut down.'
      );
    });
  });
});
