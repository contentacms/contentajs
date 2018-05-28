jest.mock('pino', () => {
  const info = jest.fn();
  const output = () => ({ info });
  output.info = info;
  return output;
});

const app = require('../app');
const Adios = require('adios');
const pino = require('pino');

describe('The web worker', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('Initializes with the adios socket', () => {
    expect.assertions(4);
    let shutdown;
    jest.spyOn(Adios.child, 'init').mockImplementation(cb => {
      shutdown = cb;
    });
    const fakeServer = {
      close: jest.fn().mockImplementation(cb => {
        cb();
      }),
    };
    jest.spyOn(app, 'listen').mockImplementation(() => fakeServer);
    const server = require('./web');
    expect(app.listen).toHaveBeenCalled();
    return shutdown().then(() => {
      expect(server.close).toHaveBeenCalled();
      expect(pino.info.mock.calls[0][0]).toBe(
        'Shutting down server for web worker %s.'
      );
      expect(pino.info.mock.calls[1][0]).toBe(
        'Server for web worker %s shut down.'
      );
    });
  });
});
