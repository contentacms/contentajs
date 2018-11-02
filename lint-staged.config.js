module.exports = {
  '*.js': ['eslint --fix', 'prettier --write', 'git add'],
  '*.md': ['npm run documentation --', 'git add *.md'],
};
