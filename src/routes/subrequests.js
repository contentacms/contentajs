// @flow

import type {
  $Request as Request,
  $Response as Response,
  NextFunction,
} from 'express';

const config = require('config');
const JsonResponse = require('subrequests-json-merger');
const { subrequestsRouterFactory } = require('subrequests-express');

const processor = (req: Request, res: Response, next: NextFunction): void => {
  const merger = config.get('subrequests.responseMerger');
  if (merger === 'json') {
    // Make sure that subrequests-json-merger merges responses using JSON.
    req.subrequestsResponseMerger = JsonResponse;
  }

  // TODO: In order to come up with the appropriate cache control header we
  // would need to analyze all the responses and understand the most
  // restrictive one. For now, we don't cache blueprints, only individual
  // calls.
  res.set('Cache-Control', 'private, max-age=0, no-cache');
  next();
};

module.exports = {
  initSubrequests(app: any) {
    const subrequestsRoute = config.get('subrequests.path');
    app.all(subrequestsRoute, processor);
    // Add the request aggregator.
    app.use(subrequestsRouterFactory(subrequestsRoute, {}, app));
  },
  processor,
};
