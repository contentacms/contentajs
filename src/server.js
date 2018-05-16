#!/usr/bin/env node
// @flow

import type { JsonRpcResponse } from '../types/jsonrpc';

const _ = require('lodash');
const config = require('config');
const cluster = require('cluster');
const os = require('os');
const Adios = require('adios');
const logger = require('pino')();

const cmsHost = config.get('cms.host');

const jsonrpc = require('./helpers/jsonrpc')(cmsHost);

const webWorkers = {};
/**
 * Spawns a web worker and tracks the pid in the webWorkers hash.
 *
 * @param {Object} context
 *   Additional info to send to the Web workers.
 *
 * @return {Worker}
 *   The child process worker.
 */
function spawnWebWorker(context: { [string]: any }) {
  const info = Object.assign(
    {},
    { type: 'webWorker', redisHost: process.env.redisHost },
    context
  );
  const worker = cluster.fork(info);
  webWorkers[worker.process.pid] = worker;
  logger.info('Starting web worker with pid: %d.', worker.process.pid);
  return worker;
}

if (cluster.isMaster) {
  // Set the process name so that it can be cleanly killed by npm stop.
  process.title = config.get('app.name.machine');

  Adios.master.init(config.get('app.adiosSocket'));

  const procs = config.get('app.processes') || os.cpus().length;

  // Initialize JSON RPC.
  jsonrpc
    .init()
    .then(requestor =>
      requestor.execute({
        jsonrpc: '2.0',
        method: 'jsonapi.metadata',
        id: 'cms-meta',
      })
    )
    .then((res: JsonRpcResponse) => {
      const jsonApiPrefix: string = _.get(res, 'result.prefix');
      // Proxy for the JSON API server in Contenta CMS.
      let x;
      for (x = 0; x < procs; x += 1) {
        spawnWebWorker({ jsonApiPrefix });
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
          spawnWebWorker({ jsonApiPrefix });
        }
      });
    });
} else if (process.env.type === 'webWorker') {
  require('./helpers/workers/web'); // eslint-disable-line global-require
}
