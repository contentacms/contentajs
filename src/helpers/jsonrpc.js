// @flow

const ContentaJsonRpc = require('./ContentaJsonRpc');

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
