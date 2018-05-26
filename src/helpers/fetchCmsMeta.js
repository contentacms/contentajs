// @flow

import type { JsonRpcResponse } from '../../types/jsonrpc';

const config = require('config');

const cmsHost = config.get('cms.host');

const jsonrpc = require('./jsonrpc')(cmsHost);

/**
 * Connects to the CMS to get some important bootstrap information.
 *
 * @return {Promise<JsonRpcResponse>}
 *   The data from the CMS used to initialize the node proxy.
 */
module.exports = (): Promise<JsonRpcResponse> =>
  jsonrpc.init().then(requestor =>
    requestor.execute([
      {
        jsonrpc: '2.0',
        method: 'jsonapi.metadata',
        id: 'cms-meta',
      },
      {
        jsonrpc: '2.0',
        method: 'redis.metadata',
        id: 'redis-meta',
      },
    ])
  );
