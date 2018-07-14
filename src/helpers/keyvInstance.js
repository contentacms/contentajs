// @flow

const config = require('config');
const Keyv = require('keyv');
const logger = require('pino')();
const KeyvLru = require('keyv-lru');
const KeyvNull = require('keyv-null');
const pkg = require('../../package.json');

// We need to manually instantiate unofficial keyv stores.
const adapterClasses = {
  lru: KeyvLru,
  nullStore: KeyvNull,
};
const activeApplicationCache = config.get('got.applicationCache.activePlugin');
const opts = config.util.toObject(
  config.get(`got.applicationCache.plugins.${activeApplicationCache}`)
);
const keyvOpts: { namespace: string, store?: Keyv } = { namespace: pkg.name };
try {
  const adapterClass = adapterClasses[activeApplicationCache];
  keyvOpts.store = new adapterClass(opts);
} catch (e) {}

const keyv = new Keyv(Object.assign({}, keyvOpts, opts));
keyv.on('error', logger.error.bind(logger));

module.exports = keyv;
