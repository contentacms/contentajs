// @flow

export type JsonRpcRequestItem = {
  jsonrpc: '2.0',
  method: string,
  params?: Array<any> | { [string]: any },
  id?: string,
};
export type JsonRpcRequest = Array<JsonRpcRequestItem> | JsonRpcRequestItem;
export type JsonRpcResponseItem = {
  jsonrpc: '2.0',
  result?: any,
  id?: string,
  error?: { code: number, message: string },
} | void;
export type JsonRpcResponse = Array<JsonRpcResponseItem> | JsonRpcResponseItem;
