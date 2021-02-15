<p align="center">
  <a href="http://runnerty.io">
    <img height="257" src="https://runnerty.io/assets/header/logo-stroked.png">
  </a>
  <p align="center">Smart Processes Management</p>
</p>

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url]
<a href="#badge">
<img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg">
</a>

# Filesystem executor for [Runnerty]:

### Installation:

Through NPM

```bash
npm i @runnerty/executor-filesystem
```

You can also add modules to your project with [runnerty-cli]

```bash
npx runnerty-cli add @runnerty/executor-filesystem
```

This command installs the module in your project, adds example configuration in your `config.json` and creates an example plan of use.

If you have installed [runnerty-cli] globally you can include the module with this command:

```bash
rty add @runnerty/executor-filesystem
```

### Configuration sample:

Add in [config.json]:

```json
{
  "id": "filesystem_default",
  "type": "@runnerty-executor-filesystem"
}
```

### Plan sample:

Add in [plan.json]:

```json
{
  "id": "filesystem_default",
  "path": "/etc/runnerty/*.log",
  "operation": "stat"
}
```

```json
{
  "id": "filesystem_default",
  "path": ["/etc/runnerty/*.log", "/etc/runnerty/*.zip"],
  "operation": "ls",
  "options": {
    "orderBy": { "attribute": ["size", "file"], "order": "desc" }
  }
}
```

#### Operations:

| Operation | Description | Output |
| --------- | ----------- | ------ |
| stat      |             |        |
| ls        |             |        |
| mkdir     |             |        |
| mv        |             |        |
| rm        |             |        |
| touch     |             |        |
| chown     |             |        |
| chmod     |             |        |
| symlink   |             |        |

#### Results output

- `PROCESS_EXEC_MSG_OUTPUT`: Array files/directories stats.
- `PROCESS_EXEC_ERR_OUTPUT`: Error output message.

[runnerty]: http://www.runnerty.io
[downloads-image]: https://img.shields.io/npm/dm/@runnerty/executor-filesystem.svg
[npm-url]: https://www.npmjs.com/package/@runnerty/executor-filesystem
[npm-image]: https://img.shields.io/npm/v/@runnerty/executor-filesystem.svg
[david-badge]: https://david-dm.org/runnerty/executor-filesystem.svg
[david-badge-url]: https://david-dm.org/runnerty/executor-filesystem
[config.json]: http://docs.runnerty.io/config/
[plan.json]: http://docs.runnerty.io/plan/
[runnerty-cli]: https://www.npmjs.com/package/runnerty-cli
