"use strict";

const fs = require("fs-extra");

const { resolveGlobPaths } = require("./lib/paths");

const { ls } = require("./operations/ls.js");
const { mkdir } = require("./operations/mkdir.js");

const Executor = require("@runnerty/module-core").Executor;

class fileSystemExecutor extends Executor {
  constructor(process) {
    super(process);
  }

  async exec(params) {
    const _this = this;
    const operation = params.operation;
    const inputPath = params.path;
    const insensitiveCase = params.insensitiveCase || true;
    const options = params.options || {};
    let endOptions = {};

    const inputPathsMatch = await resolveGlobPaths(inputPath, insensitiveCase);

    /**
     * Avaliable operations
     * - ls
     * - mkdir
     */
    switch (operation) {
      case "ls":
        let attributesOrderBy = [];
        let orderAsc = true;

        if (options.orderBy) {
          if (options.orderBy.attribute.constructor !== Array) {
            options.orderBy.attribute = [options.orderBy.attribute];
          }
          attributesOrderBy = options.orderBy.attribute;
          if (options.orderBy.order) {
            if (options.orderBy.order === "desc") {
              orderAsc = false;
            }
          }
        }

        try {
          const lsResults = await ls(
            inputPathsMatch,
            attributesOrderBy,
            orderAsc,
            false
          );

          endOptions.data_output = lsResults;

          if (lsResults.length) {
            let firstRow = lsResults[0];
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
              first_match_sizeH: firstRow.sizeH,
            };
          }
          _this.end(endOptions);
        } catch (err) {
          console.error(err);
          endOptions.end = "error";
          endOptions.messageLog = err;
          endOptions.err_output = err;
          _this.end(endOptions);
        }

        break;

      case "stat":
        try {
          const lsResults = await ls(inputPathsMatch, null, null, true);

          endOptions.data_output = lsResults;

          if (lsResults.length) {
            let firstRow = lsResults[0];
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
              first_match_sizeH: firstRow.sizeH,
            };
          }
          _this.end(endOptions);
        } catch (err) {
          console.error(err);
          endOptions.end = "error";
          endOptions.messageLog = err;
          endOptions.err_output = err;
          _this.end(endOptions);
        }

        break;

      case "mkdir":
        try {
          const mkdirRes = await mkdir(inputPath);
          endOptions.data_output = mkdirRes;
          _this.end(endOptions);
        } catch (err) {
          console.error(err);
          endOptions.end = "error";
          endOptions.messageLog = err;
          endOptions.err_output = err;
          _this.end(endOptions);
        }

        break;

      default:
        endOptions.end = "error";
        endOptions.messageLog = `Not method found for ${operation}`;
        endOptions.err_output = `Not method found for ${operation}`;
        _this.end(endOptions);
    }
  }
}

module.exports = fileSystemExecutor;
