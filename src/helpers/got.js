// @flow

import type { ObjectLiteral } from '../../flow/types/common';
import type { GotResponse } from '../../flow/types/got';

const config = require('config');
const got = require('got');
const { Agent: HttpAgent } = require('http');
const { Agent: HttpsAgent } = require('https');
const Keyv = require('keyv');
const logger = require('pino')();
const pkg = require('../../package.json');

const activeApplicationCache = config.get('applicationCache.activePlugin');
const opts = config.get(`applicationCache.plugins.${activeApplicationCache}`);
const keyv = new Keyv(opts);
keyv.on('error', logger.error.bind(logger));

const agentOptions = config.util.toObject(config.get('cms.httpAgent'));

const defaults = {
  headers: {
    'user-agent': `${pkg.name}/${
      pkg.version
    } (https://github.com/contentacms/contentajs)`,
  },
  json: true,
  cache: keyv,
  agents: {
    http: new HttpAgent(agentOptions),
    https: new HttpsAgent(agentOptions),
  },
};

/**
 * Makes a request using got with some sensible defaults.
 *
 * @param {string} url
 *   The URL to make the HTTP request to.
 * @param {Object} options
 *   An options object according to got.
 *
 * @return {Promise<any>}
 *   A promise of the response.
 */
module.exports = (
  url: string,
  options: ObjectLiteral = {}
): Promise<GotResponse> => got(url, Object.assign({}, defaults, options));
