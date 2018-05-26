// @flow

import type { ObjectLiteral } from '../../types/common';
import type { GotResponse } from '../../types/got';

const config = require('config');
const got = require('got');
const Keyv = require('keyv');
const logger = require('pino')();

const keyv = new Keyv(config.get('redis.host'));
keyv.on('error', error => {
  logger.error(error);
});

const pkg = require('../../package.json');

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
