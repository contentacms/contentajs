// @flow

const readRelativeFile = require('@contentacms/contentajs-graphql').readRelativeFile(
  __dirname
);

module.exports = [
  readRelativeFile('./Article.graphql'),
  readRelativeFile('./Query.graphql'),
  readRelativeFile('./Recipe.graphql'),
  readRelativeFile('./User.graphql'),
];
