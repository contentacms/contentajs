/* @flow */

const _ = require('lodash');
const readFile = require('../../readFileUtf8');
const path = require('path');

const relativeToFull = p => path.join(__dirname, p);

const readRelativeFile = _.flow([relativeToFull, readFile]);

module.exports = Promise.all([
  readRelativeFile('./directives.graphql'),
  readRelativeFile('./Article.graphql'),
  readRelativeFile('./Query.graphql'),
  readRelativeFile('./Recipe.graphql'),
  readRelativeFile('./User.graphql'),
]);
