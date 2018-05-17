require('flow-remove-types/register');

const _ = require('lodash');
const config = require('config');

const fetchCmsMeta = require('../src/helpers/fetchCmsMeta');

// Initialize JSON RPC.
fetchCmsMeta().then(res => {
  const jsonApiPrefix = _.get(res, '0.result.prefix');
  const redisCidTemplate = _.get(res, '1.result.cidTemplate');
  process.env.jsonApiPrefix = jsonApiPrefix;
  process.env.redisCidTemplate = redisCidTemplate;
  const app = require('../src/helpers/app'); // eslint-disable-line global-require

  app.listen(config.get('app.port'));
});
