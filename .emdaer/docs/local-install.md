## Local Installation

### Install Contenta CMS
Install Contenta CMS using [the instructions](http://www.contentacms.org/#install).

Take note of the installation URL. For instance `http://localhost:8888`.

### Install ContentaJS
Install the starter kit by using:
```
yarn add @cotentacms/contentajs
```

### Configure
Create a local configuration file. This configuration file will contain all the
configuration that **only** applies to the local development box. This file
should not be checked into the repository.

```
touch config/local.yml
``` 

Add the URL where ContentaJS will find your Contenta CMS (Drupal) installation.
You can also add the URL of the node.js instance for CORS whitelisting if you
need to have CORS support. For instance:

```yaml
cms:
  host: http://localhost:8888

cors:
  origin:
    # It's OK to use '*' in local development.
    - '*'
```

It is important to note that you can override configuration per environment.
That means that your `config/dev.yml` may look like contain:

```yaml
cms:
  host: http://127.0.0.1:8080/contentacms
```

Learn more about configuration in the
[config module's documentation](https://www.npmjs.com/package/config).

### Start your server
Start your server with multiple threads serving requests (one per CPU core).

```
yarn start
```

Inspect the `"scripts"` section in the [`package.json`](./package.json) to find
other useful scripts like `yarn debug`, `yarn stop` and `yarn test`.

### (Optional) Install the redis server
Optionally you can install the Redis server by doing `gem install redis` then
follow the setup in [`@contentacms/redis`](https://github.com/contentacms/contentajsRedis#readme).
