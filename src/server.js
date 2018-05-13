#!/usr/bin/env node
// @flow

const config = require('config');
const cluster = require('cluster');
const os = require('os');
const Adios = require('adios');
const logger = require('pino')();

const webWorkers = {};
/**
 * Spawns a web worker and tracks the pid in the webWorkers hash.
 *
 * @return {Worker}
 *   The child process worker.
 */
function spawnWebWorker() {
  const worker = cluster.fork({ type: 'webWorker', redisHost: process.env.redisHost });
  webWorkers[worker.process.pid] = worker;
  logger.info('Starting web worker with pid: %d.', worker.process.pid);
  return worker;
}

if (cluster.isMaster) {
  // Set the process name so that it can be cleanly killed by npm stop.
  process.title = config.get('app.name.machine');

  Adios.master.init(config.get('app.adiosSocket'));

  const procs = config.get('app.processes') || os.cpus().length;

  let x;
  for (x = 0; x < procs; x += 1) {
    spawnWebWorker();
  }

  cluster.on('exit', (worker, code) => {
    if (code === 0) {
      return;
    }
    logger.error('Worker %d died. Spawning a new process', worker.process.pid);
    if (webWorkers[worker.process.pid]) {
      webWorkers[worker.process.pid] = null;
      delete webWorkers[worker.process.pid];
      spawnWebWorker();
    }
  });
}
else if (process.env.type === 'webWorker') {
  require('./helpers/workers/web'); // eslint-disable-line global-require
}
