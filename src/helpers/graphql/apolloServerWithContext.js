// @flow

const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const schemaDirectives = require('./schemaDirectives');

module.exports = async (context: {
  cmsHost: string,
  jsonApiPrefix: string,
}) => {
  return new ApolloServer({
    typeDefs: await typeDefs,
    resolvers,
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
    schemaDirectives,
    context,
  });
};
