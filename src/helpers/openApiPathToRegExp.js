// @flow

/**
 * Takes a list of paths in Open API format and makes them into regexps.
 *
 * @param {string[]} paths
 *   The Open API paths.
 *
 * @return {string[]}
 *   The list of strings ready to feed a RegExp.
 */
module.exports = (paths: Array<string>): Array<string> =>
  paths
    .map(p => p.replace('/', '\\/').replace(/{[^{}/]+}/g, '[^\\/]+'))
    .map(p => `^${p}/?$`);
