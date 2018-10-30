const typeDefs = require('./index');

describe('typeDefs', () => {
  // I know this is silly... but I'd like to have 100% coverage.
  it('is what we expect', async () => {
    const schema = await Promise.all(typeDefs);
    expect(schema).toMatchSnapshot();
  });
});
