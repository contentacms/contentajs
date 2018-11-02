module.exports = {
  hooks: {
    'commit-msg': 'commitlint -e ${HUSKY_GIT_PARAMS}',
    'pre-commit': 'lint-staged && npm run lint && npm run flow',
    'pre-push': 'npm run lint && npm run flow && npm test',
  },
};
