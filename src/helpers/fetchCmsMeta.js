// @flow

import type { JsonRpcResponseItem } from '../../flow/types/jsonrpc';
import type { PluginInstance } from 'plugnplay';
import type { ObjectLiteral } from '../../flow/types/common';

const config = require('config');
const { PluginManager } = require('plugnplay');
const logger = require('pino')();

const cmsHost = config.get('cms.host');

const jsonrpc = require('./jsonrpc')(cmsHost);

/**
 * Connects to the CMS to get some important bootstrap information.
 *
 * @return {Promise<JsonRpcResponse>}
 *   The data from the CMS used to initialize the node proxy.
 */
module.exports = (): Promise<Array<[ObjectLiteral, JsonRpcResponseItem]>> => {
  let requestor;
  let pluginManager;
  // Initialize the JSON RPC requestor.
  return jsonrpc
    .init()
    .then(reqr => {
      requestor = reqr;
      // Instantiate a plugin manager to discover all possible
      // cms-meta-plugin-type plugins.
      pluginManager = new PluginManager({
        discovery: {
          rootPath:
            './{node_modules/@contentacms/**/lib,lib}/helpers/cmsMeta/plugins',
        },
      });
      return pluginManager.instantiate('cms-meta-plugin');
      // Instantiate all the CMS Meta Fetchers and fetch the data.
    })
    .then(pluginType =>
      // Execute fetch() for all the plugins of type cms-meta-plugin.
      Promise.all(
        pluginType.exports.plugins.map(descriptor =>
          pluginManager
            .instantiate(descriptor.id, { requestor })
            .then((plugin: PluginInstance) =>
              Promise.all([
                plugin.descriptor.resultMap,
                plugin.exports.fetch().catch(error => {
                  // If a particular fetcher returns an error, log it then swallow.
                  logger.error(error);
                  return error;
                }),
              ])
            )
        )
      )
    );
};
