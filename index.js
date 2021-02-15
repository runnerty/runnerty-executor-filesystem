'use strict';

const Executor = require('@runnerty/module-core').Executor;

const { resolveGlobPaths } = require('./lib/paths');
const { ls } = require('./operations/ls.js');
const { mv } = require('./operations/mv.js');
const { rm } = require('./operations/rm.js');
const { mkdir } = require('./operations/mkdir.js');
const { touch } = require('./operations/touch.js');
const { chown } = require('./operations/chown.js');
const { chmod } = require('./operations/chmod.js');
const { symlink } = require('./operations/symlink.js');

class fileSystemExecutor extends Executor {
  constructor(process) {
    super(process);
  }

  async exec(params) {
    const operation = params.operation;
    const inputPath = params.path;
    const insensitiveCase = params.insensitiveCase || true;

    const options = params.options || {};

    const endOptions = {};

    switch (operation) {
      case 'ls':
        const inputPaths = inputPath.constructor !== Array ? [inputPath] : inputPath;
        const inputPathsMatch = await resolveGlobPaths(inputPaths, insensitiveCase);
        let attributesOrderBy = [];
        let orderAsc = true;

        if (options.orderBy) {
          if (options.orderBy.attribute.constructor !== Array) {
            options.orderBy.attribute = [options.orderBy.attribute];
          }
          attributesOrderBy = options.orderBy.attribute;
          if (options.orderBy.order) {
            if (options.orderBy.order === 'desc') {
              orderAsc = false;
            }
          }
        }

        try {
          const lsResults = await ls(inputPathsMatch, attributesOrderBy, orderAsc, false);

          endOptions.data_output = lsResults;

          if (lsResults.length) {
            const firstRow = lsResults[0];
            endOptions.extra_output = {
              first_match_exists: firstRow.exists,
              first_match_file: firstRow.file,
              first_match_path: firstRow.path,
              first_match_mtimeMs: firstRow.mtimeMs,
              first_match_atimeMs: firstRow.atimeMs,
              first_match_ctimeMs: firstRow.ctimeMs,
              first_match_atime: firstRow.atime,
              first_match_mtime: firstRow.mtime,
              first_match_ctime: firstRow.ctime,
              first_match_size: firstRow.size,
              first_match_sizeH: firstRow.sizeH
            };
          }
          this.end(endOptions);
        } catch (err) {
          endOptions.end = 'error';
          endOptions.messageLog = err;
          endOptions.err_output = err;
          this.end(endOptions);
        }

        break;

      case 'stat':
        try {
          const inputPaths = inputPath.constructor !== Array ? [inputPath] : inputPath;
          const inputPathsMatch = await resolveGlobPaths(inputPaths, insensitiveCase);
          const lsResults = await ls(inputPathsMatch, null, null, true);

          endOptions.data_output = lsResults;

          if (lsResults.length) {
            const firstRow = lsResults[0];
            endOptions.extra_output = {
              first_match_exists: firstRow.exists,
              first_match_file: firstRow.file,
              first_match_path: firstRow.path,
              first_match_mtimeMs: firstRow.mtimeMs,
              first_match_atimeMs: firstRow.atimeMs,
              first_match_ctimeMs: firstRow.ctimeMs,
              first_match_atime: firstRow.atime,
              first_match_mtime: firstRow.mtime,
              first_match_ctime: firstRow.ctime,
              first_match_size: firstRow.size,
              first_match_sizeH: firstRow.sizeH
            };
          }
          this.end(endOptions);
        } catch (err) {
          endOptions.end = 'error';
          endOptions.messageLog = err;
          endOptions.err_output = err;
          this.end(endOptions);
        }

        break;

      case 'mkdir':
        try {
          const mkdirRes = await mkdir(inputPath);
          endOptions.data_output = mkdirRes;
          this.end(endOptions);
        } catch (err) {
          endOptions.end = 'error';
          endOptions.messageLog = err;
          endOptions.err_output = err;
          this.end(endOptions);
        }

        break;

      case 'mv':
        try {
          const inputPaths = inputPath.constructor !== Array ? [inputPath] : inputPath;
          const destinationPath = params.destinationPath;
          const inputPathsMatch = await resolveGlobPaths(inputPaths, insensitiveCase);
          const mvRes = await mv(inputPathsMatch, destinationPath);
          endOptions.data_output = mvRes;
          this.end(endOptions);
        } catch (err) {
          endOptions.end = 'error';
          endOptions.messageLog = err;
          endOptions.err_output = err;
          this.end(endOptions);
        }
        break;

      case 'rm':
        try {
          const inputPaths = inputPath.constructor !== Array ? [inputPath] : inputPath;
          const destinationPath = params.destinationPath;
          const inputPathsMatch = await resolveGlobPaths(inputPaths, insensitiveCase);
          const rmRes = await rm(inputPathsMatch, destinationPath);
          endOptions.data_output = rmRes;
          this.end(endOptions);
        } catch (err) {
          endOptions.end = 'error';
          endOptions.messageLog = err;
          endOptions.err_output = err;
          this.end(endOptions);
        }
        break;

      case 'touch':
        try {
          const touchRes = await touch(inputPath);
          endOptions.data_output = touchRes;
          this.end(endOptions);
        } catch (err) {
          endOptions.end = 'error';
          endOptions.messageLog = err;
          endOptions.err_output = err;
          this.end(endOptions);
        }
        break;

      case 'chown':
        try {
          const inputPaths = inputPath.constructor !== Array ? [inputPath] : inputPath;
          const inputPathsMatch = await resolveGlobPaths(inputPaths, insensitiveCase);
          const uid = params.uid;
          const guid = params.guid;

          const chownRes = await chown(inputPathsMatch, uid, guid);
          endOptions.data_output = chownRes;
          this.end(endOptions);
        } catch (err) {
          endOptions.end = 'error';
          endOptions.messageLog = err;
          endOptions.err_output = err;
          this.end(endOptions);
        }
        break;

      case 'chmod':
        try {
          const inputPaths = inputPath.constructor !== Array ? [inputPath] : inputPath;
          const permissionsMode = params.permissionsMode;
          const inputPathsMatch = await resolveGlobPaths(inputPaths, insensitiveCase);
          const chmodRes = await chmod(inputPathsMatch, permissionsMode);
          endOptions.data_output = chmodRes;
          this.end(endOptions);
        } catch (err) {
          endOptions.end = 'error';
          endOptions.messageLog = err;
          endOptions.err_output = err;
          this.end(endOptions);
        }
        break;

      case 'symlink':
        try {
          const destinationPath = params.destinationPath;
          const symlinkRes = await symlink(inputPath, destinationPath);
          endOptions.data_output = symlinkRes;
          this.end(endOptions);
        } catch (err) {
          endOptions.end = 'error';
          endOptions.messageLog = err;
          endOptions.err_output = err;
          this.end(endOptions);
        }
        break;

      default:
        endOptions.end = 'error';
        endOptions.messageLog = `Not method found for ${operation}`;
        endOptions.err_output = `Not method found for ${operation}`;
        this.end(endOptions);
    }
  }
}

module.exports = fileSystemExecutor;
