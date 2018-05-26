module.exports = {
  parser: 'babel-eslint',
  env: { node: true },
  plugins: ['prettier', 'flowtype'],
  extends: ['problems', 'plugin:prettier/recommended'],
  overrides: [
    {
      files: ['**/*.test.js'],
      env: { jest: true },
    },
  ],
};
