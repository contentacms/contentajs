module.exports = {
  '*.js': ['eslint --fix', 'prettier --write', 'git add'],
  '.emdaer/**/*.md': ['emdaer', 'git add *.md'],
};
