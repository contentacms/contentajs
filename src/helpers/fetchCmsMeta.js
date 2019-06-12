// @flow

import type { JsonRpcResponseItem } from '../../flow/types/jsonrpc';
import type { ObjectLiteral } from '../../flow/types/common';

const config = require('config');
const _ = require('lodash');
const logger = require('pino')();

const cmsHost = config.get('cms.host');

const jsonrpc = require('./jsonrpc')(cmsHost);
const openApiPathToRegExp = require('./openApiPathToRegExp');

/**
 * Connects to the CMS to get some important bootstrap information.
 *
 * @return {Promise<JsonRpcResponse>}
 *   The data from the CMS used to initialize the node proxy.
 */
module.exports = (): Promise<[ObjectLiteral, JsonRpcResponseItem]> =>
  jsonrpc
    .init()
    .then(requestor =>
      requestor.execute([
        {
          jsonrpc: '2.0',
          method: 'jsonapi.metadata',
          id: 'req-jsonapi.metadata',
        },
      ])
    )
    .then(res => {
      const response = [].concat(res).pop();
      // Contenta CMS will send the paths as the Open API specification, we need
      // them to match incoming requests so we transform them into regular
      // expressions.
      const paths = openApiPathToRegExp(
        Object.keys(_.get(response, 'result.openApi.paths', {}))
      );
      return {
        jsonrpc: '2.0',
        id: 'req-jsonapi.metadata',
        result: {
          basePath: _.get(response, 'result.openApi.basePath', ''),
          paths: JSON.stringify(paths),
        },
      };
    })
    .catch(error => {
      // If a particular fetcher returns an error, log it then swallow.
      logger.error(error);
      return error;
    })
    .then(res => [{ jsonApiPrefix: 'basePath', jsonApiPaths: 'paths' }, res]);
