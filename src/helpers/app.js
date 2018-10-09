// @flow

import type { ObjectLiteral } from '../../flow/types/common';
import type { GotResponse } from '../../flow/types/got';

/**
 * Base application definition.
 */

const _ = require('lodash');
const { ApolloServer, gql } = require('apollo-server-express');
const bodyParser = require('body-parser');
const config = require('config');
const cors = require('cors');
const express = require('express');
const { globalAgent: httpGlobalAgent } = require('http');
const { globalAgent: httpsGlobalAgent } = require('https');

const cacheControl = require('../middlewares/cacheControl');
const copyToRequestObject = require('../middlewares/copyToRequestObject');
const errorHandler = require('../middlewares/errorHandler');
const healthcheck = require('../routes/healthcheck');
const jsonrpcProxy = require('../routes/jsonrpcProxy');
const proxyHandler = require('../routes/proxyHandler');
const { initSubrequests } = require('../routes/subrequests');

const app = express();
app.disable('x-powered-by');

// Enable etags.
app.enable('etag');
app.set('etag', 'strong');
const jsonApiPrefix = _.get(process, 'env.jsonApiPrefix', '/jsonapi');
const jsonApiPaths = JSON.parse(_.get(process, 'env.jsonApiPaths', '[]'));
const cmsHost = config.get('cms.host');

// Set the global agent options
const agentOptions = config.util.toObject(config.get('cms.httpAgent'));
Object.keys(agentOptions).forEach(key => {
  _.set(httpGlobalAgent, [key], agentOptions[key]);
  _.set(httpsGlobalAgent, [key], agentOptions[key]);
});

const corsHandler = cors(config.util.toObject(config.get('cors')));
app.use(corsHandler);
// Adds support for preflight OPTIONS requests on all routes.
app.options('*', corsHandler);

// Initialize the request object with valuable information.
app.use(copyToRequestObject({ jsonApiPrefix, jsonApiPaths, cmsHost }));

// Healthcheck is a special endpoint used for application monitoring.
app.get('/healthcheck', healthcheck);

// Set cache control header.
app.use(cacheControl);

// Proxy for the JSON API server in Contenta CMS.
app.use(jsonApiPrefix, bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(jsonApiPrefix, proxyHandler);
// Forward JSON RPC requests to the CMS.
app.use('/jsonrpc', jsonrpcProxy);

initSubrequests(app);

// Fallback error handling. If there is any unhandled exception or error,
// catch them here to allow the app to continue normally.
app.use(errorHandler);

const got = require('./got');
const Recipe = gql`
  type Recipe {
    id: String!
    title: String!
    author: User!
  }
`;
const Article = gql`
  type Article {
    id: String!
    title: String!
    owner: User!
  }
`;
const User = gql`
  type User {
    id: String!
    name: String!
    recipes: [Recipe]
  }
`;
const Query = gql`
  type Query {
    recipesByAuthor(authorName: String!): [Recipe] @fromJsonApi(/recipes?filter[author.name]={authorName}&include=author)
    articlesByAuthor(authorName: String!): [Article] @fromJsonApi(/articles?filter[owner.name]={authorName}&include=owner)
  }
`;
type JsonApiResourceIdentifier = {
  type: string,
  id: string,
};
type JsonApiBase = {
  meta: ObjectLiteral,
  links: { [string]: string },
};
type JsonApiRelatonship = ?JsonApiBase & {
  data: JsonApiResourceIdentifier | JsonApiResourceIdentifier[],
};
type JsonApiResource = JsonApiResourceIdentifier &
  ?JsonApiBase & {
    attributes?: ObjectLiteral,
    relationships?: { [string]: JsonApiRelatonship },
  };
type JsonApiDocument = ?JsonApiBase & {
  data: JsonApiResource | JsonApiResource[],
};

/**
 *
 * @param rels
 * @param includes
 * @param relMap
 * @return {{[p: string]: any}|{}|(function(): {[p: string]: *})}
 */
function findRelsInIncludes(
  rels: { [string]: JsonApiRelatonship },
  includes: JsonApiResource[],
  relMap: Map<string, ?JsonApiResource>
) {
  const relNames = Object.keys(rels);
  const relVals = relNames.map(relName => {
    const type = _.get(rels, [relName, 'data', 'type']);
    const id = _.get(rels, [relName, 'data', 'id']);
    const cacheKey = `${type}:${id}`;
    let included;
    if (relMap.has(cacheKey)) {
      included = relMap.get(cacheKey);
    } else {
      included = includes.find(
        include => include.type === type && include.id === id
      );
      relMap.set(cacheKey, included);
    }
    return included ? mapJsonApiObjects(included) : null;
  });
  return _.zipObject(relNames, relVals);
}

/**
 *
 * @param input
 * @param includes
 * @return {any}
 */
function mapJsonApiObjects(
  input: JsonApiResource[] | JsonApiResource,
  includes: JsonApiResource[] = []
) {
  const relMap = new Map();
  const mapped = [].concat(input).map(item => ({
    id: _.get(item, 'id'),
    type: _.get(item, 'type'),
    ..._.get(item, 'attributes'),
    ...findRelsInIncludes(_.get(item, 'relationships'), includes, relMap),
  }));
  return Array.isArray(input) ? mapped : mapped.pop();
}
const resolvers = {
  Query: {
    // TODO: Use the jsonApiPaths variable for this below.
    recipesByAuthor: async (___, { authorName }) => {
      const jsonApiQuery = `${cmsHost}${jsonApiPrefix}/recipes?filter[author.name]=${authorName}&include=author`;
      const res: GotResponse = await got(jsonApiQuery);
      return mapJsonApiObjects(
        _.get(res, 'body.data'),
        _.get(res, 'body.included')
      );
    },
    articlesByAuthor: async (___, { authorName }) => {
      const jsonApiQuery = `${cmsHost}${jsonApiPrefix}/articles?filter[owner.name]=${authorName}&include=owner`;
      const res: GotResponse = await got(jsonApiQuery);
      return mapJsonApiObjects(
        _.get(res, 'body.data'),
        _.get(res, 'body.included')
      );
    },
  },
};
const server = new ApolloServer({
  // These will be defined for both new or existing servers
  typeDefs: [Recipe, Article, User, Query],
  resolvers,
});
server.applyMiddleware({
  app,
  path: '/graphql',
});

module.exports = app;
