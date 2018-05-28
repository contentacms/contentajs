// @flow

const config = require('config');

const subRouteRE = new RegExp(`^/[^/]+/([^/?#]+)`);

module.exports = (req: any, res: any, next: Function): void => {
  // If this is a GET, set our global cache control header. Routes will be
  // able to override or remove this as needed.
  if (req.method === 'GET' || req.method === 'OPTIONS') {
    let maxAge = config.get('cache.max-age.OPTIONS');
    if (req.method === 'GET') {
      maxAge = config.get('cache.max-age.default');
      const subRoute = req.url.match(subRouteRE);
      if (subRoute && config.has(`cache.max-age.${subRoute[1]}`)) {
        maxAge = config.get(`cache.max-age.${subRoute[1]}`);
      }
    }
    res.set('Cache-Control', `public, max-age=${maxAge}`);
  }

  next();
};
