const bootstrap = require('./bootstrap');

jest.mock('./helpers/fetchCmsMeta', () => () =>
  Promise.resolve([
    { jsonApiPrefix: 'basePath' },
    {
      result: {
        basePath: '/myPrefix',
        paths: ['/foo', '/foo/{bar}', '/foo/{bar}/oof/{baz}'],
      },
    },
  ])
);

describe('The bootstrap process', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('It can start the application', async done => {
    expect.assertions(2);
    const server = await bootstrap(12345);
    expect(server.listening).toBe(true);
    expect(server.address().port).toBe(12345);
    server.close(done);
  });
});
