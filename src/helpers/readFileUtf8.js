/* @flow */

const { readFile } = require('fs-extra');

/**
 * Retrieve a file's contents with utf8 encoding.
 *
 * @param path The file whose contents should be retrieved.
 *
 * @return the file's contents as a UTF-8 encoded string.
 */
module.exports = async (path: string): Promise<string> =>
  readFile(path, 'utf8');
