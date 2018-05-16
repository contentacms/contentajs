// @flow

import type { JsonRpcRequest, JsonRpcResponse } from '../../types/jsonrpc';

const _ = require('lodash');
const got = require('./got');

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
        const body: { [string]: any } = _.get(res, 'body');
        this.methods = body.data.map(method => method.id).filter(i => i);
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
    // TODO: We probably want to validate input here with a JSON Schema.
    if (
      !Array.isArray(request) &&
      this.methods.indexOf(request.method) === -1
    ) {
      return Promise.reject(
        new Error(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: 'Method not found',
            },
          })
        )
      );
    }
    return (
      got(`${this.host}/jsonrpc`, {
        method: 'POST',
        json: true,
        body: request,
      })
        // Reject if the request errored and is not a batched request.
        .then(res => {
          const body: JsonRpcResponse = _.get(res, 'body');
          const isError = body && typeof _.get(body, 'error') !== 'undefined';
          return isError
            ? Promise.reject(new Error(JSON.stringify(body)))
            : Promise.resolve(body);
        })
    );
  }
}
module.exports = (host: string) => {
  const jsonrpc = new ContentaJsonRpc(host);
  return {
    init(): Promise<ContentaJsonRpc> {
      return jsonrpc.init().then(() => jsonrpc);
    },
    jsonrpc,
    ContentaJsonRpc,
  };
};
