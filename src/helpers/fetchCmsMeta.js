// @flow

import type { JsonRpcResponse } from '../../types/jsonrpc';

const config = require('config');

const cmsHost = config.get('cms.host');

const jsonrpc = require('./jsonrpc')(cmsHost);

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
