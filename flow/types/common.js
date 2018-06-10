// @flow

import type {
  $Request as Request,
  $Response as Response,
  NextFunction,
} from 'express';

export type ObjectLiteral = { [string]: any };

export interface RequestHandler {
  (req: Request, res: Response, next?: NextFunction): any;
}
