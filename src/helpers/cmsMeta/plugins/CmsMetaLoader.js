// @flow

import type ContentaJsonRpc from '../../ContentaJsonRpc';
import type { JsonRpcResponse } from '../../../../flow/types/jsonrpc';

const { PluginLoaderBase } = require('plugnplay');

class CmsMetaLoader extends PluginLoaderBase {
  /**
   * Exports the plugin content synchronously.
   *
   * @param {Object} options
   *   Run-time options to configure your exports.
   *
   * @return {Object}
   *   An object with the functionality.
   */
  exportSync(options: {
    requestor: ContentaJsonRpc,
  }): { fetch: () => Promise<JsonRpcResponse> } {
    const { requestor } = options;
    const method: string = this.descriptor.rpcMethod;
    if (!method) {
      throw new Error(
        `Impossible to fetch metadata from the CMS using "${this.descriptor.id}" because the "rpcMethod" key is missing in plugnplay.yml`
      );
    }
    return {
      fetch: () =>
        requestor.execute({
          jsonrpc: '2.0',
          method,
          id: `req-${method}`,
        }),
    };
  }
}

module.exports = CmsMetaLoader;
