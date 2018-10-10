## Local Installation

### Install Contenta CMS
Install Contenta CMS using [the instructions](http://www.contentacms.org/#install).

Take note of the installation URL. For instance `http://localhost:8888`.

### Install ContentaJS
Install the starter kit by using downloading [the
package](https://github.com/contentacms/contentajs/archive/master.tar.gz) and
extracting it. In MacOS and Linux you can do:

```
curl -Lo contenta.tar.gz https://github.com/contentacms/contentajs/archive/master.tar.gz
tar -xzf contenta.tar.gz
mv contenta-master YOUR_PROJECT_NAME
cd YOUR_PROJECT_NAME
npm install
git init && git add . && git ci -m 'feat: project initialization with Contenta JS'
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
That means that your `config/staging.yml` may contain:

```yaml
cms:
  host: http://stg.example.com
```

Learn more about configuration in the
[config module's documentation](https://www.npmjs.com/package/config).

### Start your server
Start your server with multiple threads serving requests (one per CPU core).
This uses the [PM2](https://pm2.io/doc/en/runtime/overview/) module. Edit the
[`ecosystem.config.js`](./ecosystem.config.js) file to tune how to start your
app. Read
[the documentation](https://pm2.io/doc/en/runtime/reference/ecosystem-file/) for
the PM2 ecosystem file.

```
npm start
```

Inspect the `"scripts"` section in the [`package.json`](./package.json) to find
other useful scripts like `npm run debug`, `npm run stop` and `npm run test`.

### (Optional) Install the redis server
Optionally you can install the Redis server by doing `gem install redis` then
follow the setup in [`@contentacms/redis`](https://github.com/contentacms/contentajsRedis#readme).
