// @flow

import type { ObjectLiteral } from '../../flow/types/common';
import type { GotResponse } from '../../flow/types/got';

const config = require('config');
const got = require('got');
const Keyv = require('keyv');
const logger = require('pino')();
const pkg = require('../../package.json');

const activeApplicationCache = config.get('applicationCache.activePlugin');
const host = config.get(
  `applicationCache.plugins.${activeApplicationCache}.host`
);
const keyv = new Keyv(host);
keyv.on('error', logger.error.bind(logger));

const defaults = {
  headers: {
    'user-agent': `${pkg.name}/${
      pkg.version
    } (https://github.com/contentacms/contentajs)`,
  },
  json: true,
  cache: keyv,
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
