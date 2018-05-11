// @flow

export type GenericPoolOptions = {
  max: ?number,
  min: ?number,
  maxWaitingClients: ?number,
  testOnBorrow: ?boolean,
  acquireTimeoutMillis: ?number,
  fifo: ?boolean,
  priorityRange: ?number,
  autostart: ?boolean,
  evictionRunIntervalMillis: ?number,
  numTestsPerRun: ?number,
  softIdleTimeoutMillis: ?number,
  idleTimeoutMillis: ?number,
  Promise: ?(typeof Promise),
};
