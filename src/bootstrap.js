const _ = require('lodash');

const fetchCmsMeta = require('./helpers/fetchCmsMeta');
const startApp = require('./helpers/app');

module.exports = async port => {
  // Initialize JSON RPC.
  const [map, jsonRpcResponse] = await fetchCmsMeta();
  const mapped = {};
  Object.keys(map).forEach(variableName => {
    const variableValue = _.get(jsonRpcResponse, [
      'result',
      ...map[variableName].split('.'),
    ]);
    mapped[variableName] = variableValue;
  });
  // Proxy for the JSON API server in Contenta CMS.
  const app = await startApp(mapped);
  return app.listen(port);
};
