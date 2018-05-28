// @flow

import type { JsonRpcResponse } from '../flow/types/jsonrpc';

const _ = require('lodash');
const config = require('config');
const cluster = require('cluster');
const os = require('os');
const Adios = require('adios');
const logger = require('pino')();

const fetchCmsMeta = require('./helpers/fetchCmsMeta');

/**
 * Spawns a web worker and tracks the pid in the webWorkers hash.
 *
 * @param {Object} context
 *   Additional info to send to the Web workers.
 * @param {Object} webWorkers
 *   The repository of web workers.
 *
 * @return {Worker}
 *   The child process worker.
 */
const spawnWebWorker = (
  context: { [string]: any },
  webWorkers: { [number]: * }
) => {
  const info = Object.assign(
    {},
    { type: 'webWorker', redisHost: process.env.redisHost },
    context
  );
  const worker = cluster.fork(info);
  webWorkers[worker.process.pid] = worker;
  logger.info('Starting web worker with pid: %d.', worker.process.pid);
  return worker;
};

const bootstrap = () => {
  const webWorkers = {};
  if (cluster.isMaster) {
    // Set the process name so that it can be cleanly killed by npm stop.
    process.title = config.get('app.name.machine');
    Adios.master.init(config.get('app.adiosSocket'));
    const procs = config.get('app.processes') || os.cpus().length;

    // Initialize JSON RPC.
    return fetchCmsMeta().then((res: JsonRpcResponse) => {
      const jsonApiPrefix: string = _.get(res, '0.result.prefix');
      const redisCidTemplate: string = _.get(res, '1.result.cidTemplate');
      const redisPrefix: string = _.get(res, '1.result.prefix');
      // Proxy for the JSON API server in Contenta CMS.
      let x;
      for (x = 0; x < procs; x += 1) {
        spawnWebWorker(
          { jsonApiPrefix, redisCidTemplate, redisPrefix },
          webWorkers
        );
      }

      cluster.on('exit', (worker, code) => {
        if (code === 0) {
          return;
        }
        logger.error(
          'Worker %d died. Spawning a new process',
          worker.process.pid
        );
        if (webWorkers[worker.process.pid]) {
          webWorkers[worker.process.pid] = null;
          delete webWorkers[worker.process.pid];
          spawnWebWorker({ jsonApiPrefix }, webWorkers);
        }
      });
    });
  } else if (process.env.type === 'webWorker') {
    require('./helpers/workers/web'); // eslint-disable-line global-require
  }
};

module.exports = { spawnWebWorker, bootstrap };
