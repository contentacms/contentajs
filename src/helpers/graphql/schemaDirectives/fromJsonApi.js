// @flow

import type { GraphQLFieldResolver } from 'graphql';
import type { ObjectLiteral } from '../../../../flow/types/common';
import type {
  JsonApiRelatonship,
  JsonApiResource,
} from '../../../../flow/types/jsonapi';
import type { GotResponse } from '../../../../flow/types/got';

type Resolver = GraphQLFieldResolver<
  ObjectLiteral,
  ObjectLiteral,
  ObjectLiteral
>;
type FieldDefinition = { resolve: Resolver };

const _ = require('lodash');
const { defaultFieldResolver, GraphQLList } = require('graphql');
const { SchemaDirectiveVisitor } = require('graphql-tools');

const got = require('../../got');

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
 * Maps a JSON API object into the GraphQL schema.
 *
 * @param {JsonApiResource[] | JsonApiResource} input
 *   The 'data' contents of a JSON API document.
 * @param {JsonApiResource[]} includes
 *   The 'included' property of a JSON API document.
 *
 * @return {any}
 *   The resolved shape according to the GraphQL schema.
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

const processApiResponse = (res: GotResponse, isList: boolean) => {
  let data = _.get(res, 'body.data');
  if (isList) {
    data = Array.isArray(data) ? data : [data];
  } else {
    data = Array.isArray(data) ? data[0] : data;
  }
  return mapJsonApiObjects(data, _.get(res, 'body.included'));
};

const applyTemplateVariables = (subject: string, vars: ObjectLiteral): string =>
  Object.keys(vars).reduce(
    (carry, varName) =>
      carry.replace(
        new RegExp(`{${varName}}`),
        encodeURIComponent(vars[varName])
      ),
    subject
  );

class ResolvesToType extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: FieldDefinition) {
    return this.visitInputFieldDefinition(field);
  }
  visitInputFieldDefinition(field: FieldDefinition) {
    // We must mutate the passed field definition because, otherwise, directives
    // override each other, allowing only one directive at a time.
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async (src, args, context) => {
      // First try to resolve with explicit resolvers.
      try {
        const defaultRes = await resolve.apply(this, src, args, context);
        if (!_.isUndefined(defaultRes)) {
          return defaultRes;
        }
      } catch (e) {}
      // Then fallback to object mapping.
      const { query } = this.args;
      const { cmsHost, jsonApiPrefix } = context;
      const jsonApiQuery = `${cmsHost}${jsonApiPrefix}${query}`;
      // Replace variable placeholders.
      const res = await got(applyTemplateVariables(jsonApiQuery, args));
      const resolved = processApiResponse(
        res,
        this.visitedType.type instanceof GraphQLList
      );
      // TODO: For any explicitly resolved fields, execute the resolvers manually.
      return resolved;
    };
  }
}

module.exports = ResolvesToType;
