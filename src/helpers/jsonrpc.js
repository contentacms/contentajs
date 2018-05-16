// @flow

import type { JsonRpcRequest, JsonRpcResponse } from '../../types/jsonrpc';

const got = require('got');

/**
 * A class for a JSON RPC executor.
 */
class ContentaJsonRpc {
  /**
   * The location of the CMS with auto-dicovery.
   */
  host: string;

  /**
   * The list of methods available in the Contenta CMS side.
   */
  methods: string[];

  /**
   * Constructs a ContentaJsonRpc object.
   *
   * @param {string} cmsHost
   *   The location of the CMS with auto-dicovery.
   */
  constructor(cmsHost: string) {
    this.host = cmsHost;
  }

  /**
   * Reads from the discovery endpoint and attaches the methods to the object.
   *
   * @return {Promise<void>}
   *   Resolves when initialized.
   */
  init(): Promise<void> {
    return got(`${this.host}/jsonrpc/methods`)
      .then(res => {
        this.methods = res.data.map(method => method.id).filter(i => i);
      })
      .then(() => {});
  }

  /**
   * Executes the provided JSON RPC request against Contenta CMS.
   *
   * @param {JsonRpcRequest} request
   *   The request object according to the spec.
   *
   * @return {Promise<JsonRpcResponse>}
   *   The response from the Contenta CMS JSON-RPC server.
   */
  execute(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    if (
      !Array.isArray(request) &&
      this.methods.indexOf(request.method) !== -1
    ) {
      const res: JsonRpcResponse = {
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found',
        },
      };
      return Promise.reject(res);
    }
    const res: Promise<JsonRpcResponse> = got.post(`${this.host}/jsonrpc`, {
      json: true,
      body: request,
    });
    return res;
  }
}
let jsonrpc;
module.exports = {
  init(host: string): Promise<ContentaJsonRpc> {
    const inst = new ContentaJsonRpc(host);
    return inst.init().then(() => {
      jsonrpc = inst;
      return jsonrpc;
    });
  },
  jsonrpc,
};
