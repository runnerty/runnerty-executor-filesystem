"use strict";

const fs = require("fs-extra");
const bytes = require("bytes");
const path = require("path");
const glob = require("glob");
const lodash = require("lodash");
const {promisify} = require("util");
const globAsync = promisify(glob);

var Execution = global.ExecutionClass;

class fileSystemExecutor extends Execution {
  constructor(process) {
    super(process);
  }

  exec(params) {
    let _this = this;
    const operation = params.operation;
    const inputPath = params.path;
    const insensitiveCase = params.insensitiveCase || true;
    const options = params.options || {};
    let endOptions = {};

    /**
     * Avaliable operations
     * - ls
     * - mkdir
     */
    switch (operation) {
      case "ls":
      case "stat":
        let attributesOrderBy = [];
        let orderAsc = true;

        if(options.orderBy){
          if (options.orderBy.attribute.constructor !== Array) {
            options.orderBy.attribute = [options.orderBy.attribute];
          }
          attributesOrderBy = options.orderBy.attribute;
          if (options.orderBy.order){
            if (options.orderBy.order === "desc"){
              orderAsc = false;
            }
          }
        }

        const isSubDir = (operation === "stat");

        _ls(inputPath, attributesOrderBy, orderAsc, insensitiveCase, isSubDir)
          .then(res => {
            endOptions.data_output = res;
            const firstRow = res[0];
            if (res.length) {
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
            _this.end(endOptions);
          })
          .catch(err => {
            endOptions.data_output = [];
            endOptions.extra_output = {
              first_match_exists: "",
              first_match_file: "",
              first_match_path: "",
              first_match_mtimeMs: "",
              first_match_atimeMs: "",
              first_match_ctimeMs: "",
              first_match_atime: "",
              first_match_mtime: "",
              first_match_ctime: "",
              first_match_size: "",
              first_match_sizeH: ""
            };
            endOptions.end = "error";
            endOptions.messageLog = err;
            endOptions.err_output = err;
            _this.end(endOptions);
          });
        break;
      case "mkdir":
        _mkdirs(inputPath)
          .then(res =>{
            let endOptions = {};
            endOptions.data_output = res;
            _this.end(endOptions);
          })
          .catch(err =>{
            endOptions.end = "error";
            endOptions.messageLog = err;
            endOptions.err_output = err;
            _this.end(endOptions);
          });
        break;
      default:
        endOptions.end = "error";
        endOptions.messageLog = `Not method found for ${operation}`;
        endOptions.err_output = `Not method found for ${operation}`;
        _this.end(endOptions);
    }
  }
}

/**
 * Return array with all files and directories founds by paths indicates
 * @param paths (glob compatible)
 * @param orders:  array of field ordering
 * @param orderAsc: boolean asc (true) or desc order
 * @param insensitiveCase: insensitive case glob
 * @param isSubDir: if set true and paths is a folder function return stat info.
 *                  if set false return recurrent contain folder stats.
 * @returns {Promise} - array:  stats results files and folders.
 * @private
 */
function _ls(paths, orders = [], orderAsc = true, insensitiveCase = true, isSubDir = true) {
  return new Promise((resolve,reject) => {
    if (paths.constructor !== Array) {
      paths = [paths];
    }

    _curatePath(paths, insensitiveCase)
      .then(curatePaths =>{
        let pathsLsPromises = [];
        curatePaths.map(_path => {
          // If _ls paths input is the same that _curatePath output is not a curate path, return content.
          if (paths.indexOf(_path) !== -1) isSubDir = false;
          pathsLsPromises.push(lsAsync(_path, isSubDir));
        });

        Promise.all(pathsLsPromises)
          .then(values => {
            let res = [].concat(...values);
            if (orders.length) res = lodash.sortBy(res, orders);
            if (!orderAsc) res = res.reverse();
            resolve(res);
          });
      })
      .catch(err =>{
        reject(err);
      });
  });
}

/**
 * Return array with all dirs created or reject with error.
 * If dir exists return null into te array.
 * @param path
 * @returns {Promise} - array
 * @private
 */
function _mkdirs(paths) {
  return new Promise((resolve,reject) => {
    if (paths.constructor !== Array) {
      paths = [paths];
    }

    let pathsEnsureDirPromises = [];
    paths.map(_path => {
      pathsEnsureDirPromises.push(fs.ensureDir(_path));
    });

    Promise.all(pathsEnsureDirPromises)
      .then(values => {
        let res = [].concat(...values);
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * Return array with all coincident glob result from path or paths input
 * @param path
 * @param insensitiveCase
 * @returns {Promise} - array
 * @private
 */
function _curatePath(paths, insensitiveCase = true) {
  return new Promise((resolve,reject) => {
    if (paths.constructor !== Array) {
      paths = [paths];
    }

    let pathsGlobPromises = [];
    paths.map(_path => {
      pathsGlobPromises.push(globAsync(_path, {nocase: insensitiveCase}));
    });

    Promise.all(pathsGlobPromises)
      .then(values => {
        const res = [].concat(...values);
        if (res.length){
          resolve(res);
        }else{
          reject("No results found for indicated paths");
        }
      });
  });
}

/**
 * Return folder content
 * @param path
 * @returns {Promise}
 * @private
 */
function _readdirAsync(path) {
  return new Promise(function (resolve, reject) {
    if (path !== undefined) {
      fs.readdir(path, function (err, list) {
        if (err) {
          reject(err);
        } else {
          resolve(list);
        }
      });
    } else {
      reject("Undefined path");
    }
  });
}

/**
 * Return async stats files and folders
 * @param file
 * @param isSubDir
 * @returns {Promise}
 */
function lsAsync(file, isSubDir = false) {
  return new Promise(function (resolve, reject) {
    fs.stat(file, (err, stat) => {
      if (err) {
        reject(err);
      } else {
        let res;
        if (stat.isFile() || (stat.isDirectory() && isSubDir)) {
          res = {
            file: file.split(path.sep).pop(),
            path: file,
            mtimeMs: stat.mtimeMs,
            atimeMs: stat.atimeMs,
            ctimeMs: stat.ctimeMs,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            size: stat.size,
            sizeH: bytes(stat.size),
            isFile: stat.isFile()?1:0,
            isDirectory: stat.isDirectory()?1:0,
            exists: 1
          };
          resolve(res);
        } else {
          if (stat.isDirectory()) {
            _readdirAsync(file)
              .then(files =>{
                let resPromises = [];
                files.map(f => {
                  resPromises.push(lsAsync(path.join(file, f), true));
                });

                Promise.all(resPromises)
                  .then(res => {
                    res = res.filter(Boolean);
                    resolve(res);
                  });
              })
              .catch(err => {
                reject(err);
              });
          } else {
            reject(`File is not valid: ${file}`);
          }
        }
      }
    });
  });
}

module.exports = fileSystemExecutor;