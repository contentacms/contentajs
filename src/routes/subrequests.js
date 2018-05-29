// @flow

const config = require('config');
const JsonResponse = require('subrequests-json-merger');
const { subrequestsRouterFactory } = require('subrequests-express');

const subrequestsRoute = config.get('subrequests.path');
const merger = config.get('subrequests.responseMerger');

module.exports = {
  initSubrequests(app: any) {
    app.all(subrequestsRoute, (req: any, res: any, next: Function): void => {
      if (merger === 'json') {
        // Make sure that subrequests-json-merger merges responses using JSON.
        req.subrequestsResponseMerger = JsonResponse;
      }

      // TODO: In order to come up with the appropriate cache control header we
      // would need to analyze all the responses and understand the most
      // restrictive one. For now, we don't cache blueprints, only individial
      // calls.
      res.set('Cache-Control', 'private, max-age=0, no-cache');
      next();
    });
    // Add the request aggregator.
    app.use(subrequestsRouterFactory(subrequestsRoute, {}, app));
  },
};
