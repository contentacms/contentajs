// @flow

/**
 * Web worker code. Will start a webserver listening on the specified port.
 */
const config = require('config');
const logger = require('pino')();
const Adios = require('adios');

const app = require('../app');

const server = app.listen(config.get('app.port'));

Adios.child.init(
  () =>
    new Promise(resolve => {
      logger.info('Shutting down server for web worker %s.', process.pid);
      server.close(() => {
        logger.info('Server for web worker %s shut down.', process.pid);
        resolve();
      });
    }),
  config.get('app.adiosSocket')
);

module.exports = server;
