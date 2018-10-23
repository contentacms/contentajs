// @flow

import type { ObjectLiteral } from './common';

export type JsonApiBase = {
  meta: ObjectLiteral,
  links: { [string]: string },
};
export type JsonApiResourceIdentifier = {
  type: string,
  id: string,
};
export type JsonApiRelatonship = ?JsonApiBase & {
  data: JsonApiResourceIdentifier | JsonApiResourceIdentifier[],
};
export type JsonApiResource = JsonApiResourceIdentifier &
  ?JsonApiBase & {
    attributes?: ObjectLiteral,
    relationships?: { [string]: JsonApiRelatonship },
  };
export type JsonApiDocument = ?JsonApiBase & {
  data: JsonApiResource | JsonApiResource[],
};
