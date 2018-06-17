const bst = require('./bootstrap');
const cluster = require('cluster');
const Adios = require('adios');

jest
  .spyOn(cluster, 'fork')
  .mockImplementation(() => ({ process: { pid: 42 } }));
jest.mock('./helpers/fetchCmsMeta', () => () =>
  Promise.resolve([
    [
      { jsonApiPrefix: 'prefix' },
      {
        result: {
          openApi: {
            basePath: '/myPrefix',
            paths: ['/foo', '/foo/{bar}', '/foo/{bar}/oof/{baz}'],
          },
        },
      },
    ],
  ])
);
jest.spyOn(Adios.master, 'init').mockImplementation();
jest.mock('pino', () => {
  const error = jest.fn();
  const info = jest.fn();
  const mock = () => ({ error, info });
  mock.error = error;
  mock.info = info;
  return mock;
});

const pino = require('pino');

describe('The bootstrap process', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('It spawns multiple processes', () => {
    expect.assertions(7);
    cluster.isMaster = true;
    return bst.bootstrap().then(() => {
      expect(Adios.master.init).toHaveBeenCalledWith('./adios.sock');
      expect(pino.info).toHaveBeenCalledWith(
        'Starting web worker with pid: %d.',
        42
      );
      expect(pino.info).toHaveBeenCalledWith(
        'Starting web worker with pid: %d.',
        42
      );
      expect(cluster.fork).toHaveBeenCalledTimes(2);
      const onExit = cluster.listeners('exit')[0];
      expect(onExit(null, 0)).toBeUndefined();
      onExit({ process: { pid: 987654 } }, 123);
      expect(pino.error).toHaveBeenCalledWith(
        'Worker %d died. Spawning a new process',
        987654
      );
      onExit({ process: { pid: 42 } }, 123);
      expect(cluster.fork).toHaveBeenCalledTimes(3);
    });
  });

  test('It spawns one process per CPU', () => {
    expect.assertions(1);
    cluster.isMaster = true;
    const config = require('config');
    jest.spyOn(config, 'get').mockImplementation(() => {});
    return bst.bootstrap().then(() => {
      expect(cluster.fork.mock.calls.length).toBeGreaterThan(0);
    });
  });

  test('It invokes the web worker', () => {
    // This is weird, but all we want is to trigger the code path of a dynamic
    // require statement. The code coverage threshold will ensure that all is
    // executed properly.
    expect.assertions(0);
    jest.mock('./helpers/workers/web', () => {});
    cluster.isMaster = false;
    process.env.type = 'webWorker';
    return bst.bootstrap();
  });

  test('It ignores unknown workers', () => {
    // This is weird, but all we want is to trigger the code path of a dynamic
    // require statement. The code coverage threshold will ensure that all is
    // executed properly.
    expect.assertions(0);
    jest.mock('./helpers/workers/web', () => {});
    cluster.isMaster = false;
    process.env.type = 'the-unknown-lives-here';
    return bst.bootstrap();
  });
});
