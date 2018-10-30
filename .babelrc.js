module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: true,
        },
        shippedProposals: true,
      },
    ],
    '@babel/preset-flow',
  ],
  plugins: ['@babel/plugin-proposal-object-rest-spread'],
};
