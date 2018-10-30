// @flow

const { simpleServerWithContext } = require('@contentacms/contentajs-graphql');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolverMap');

module.exports = async (context: {
  cmsHost: string,
  jsonApiPrefix: string,
}) => {
  return simpleServerWithContext(context, typeDefs, resolvers);
};
