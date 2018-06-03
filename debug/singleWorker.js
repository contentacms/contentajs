require('flow-remove-types/register');

const _ = require('lodash');
const config = require('config');

const fetchCmsMeta = require('../src/helpers/fetchCmsMeta');

// Initialize JSON RPC.
fetchCmsMeta().then(res => {
  const mapped = {};
  res.forEach(([map, jsonRpcResponse]) => {
    Object.keys(map).forEach(variableName => {
      const variableValue = _.get(jsonRpcResponse, [
        'result',
        map[variableName],
      ]);
      mapped[variableName] = variableValue;
    });
  });
  Object.assign(process.env, mapped);
  const app = require('../src/helpers/app'); // eslint-disable-line global-require

  app.listen(config.get('app.port'));
});
