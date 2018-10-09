const _ = require('lodash');

const fetchCmsMeta = require('./helpers/fetchCmsMeta');
const startApp = require('./helpers/app');

module.exports = async port => {
  // Initialize JSON RPC.
  const fetched = await fetchCmsMeta();
  const mapped = {};
  fetched.forEach(([map, jsonRpcResponse]) => {
    Object.keys(map).forEach(variableName => {
      const variableValue = _.get(jsonRpcResponse, [
        'result',
        ...map[variableName].split('.'),
      ]);
      mapped[variableName] = variableValue;
    });
  });
  // Proxy for the JSON API server in Contenta CMS.
  const app = startApp(mapped);
  return app.listen(port);
};
