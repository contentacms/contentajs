// @flow

const got = require('got');

const pkg = require('../../package.json');

const defaults = {
  headers: {
    'user-agent': `${pkg.name}/${
      pkg.version
    } (https://github.com/contentacms/contentajs)`,
  },
  json: true,
};

module.exports = (url: string, options: Object = {}): Promise<any> =>
  got(url, Object.assign({}, defaults, options));
