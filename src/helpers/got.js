// @flow

import type { ObjectLiteral } from '../../flow/types/common';
import type { GotResponse } from '../../flow/types/got';

const config = require('config');
const got = require('got');
const { Agent: HttpAgent } = require('http');
const { Agent: HttpsAgent } = require('https');
const pkg = require('../../package.json');

const keyv = require('./keyvInstance');

const agentOptions = config.util.toObject(config.get('got.httpAgent'));

const defaults = {
  headers: {
    'user-agent': `${pkg.name}/${
      pkg.version
    } (https://github.com/contentacms/contentajs)`,
  },
  json: true,
  cache: keyv,
  // Override the global agent options, since that is tuned for
  // express-http-proxy.
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
