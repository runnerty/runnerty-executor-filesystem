const fs = require('fs-extra');
const bytes = require('bytes');
const path = require('path');
const lodash = require('lodash');

/**
 * Return array with all files and directories founds by paths indicates
 * @param paths
 * @param orders:  array of field ordering
 * @param orderAsc: boolean asc (true) or desc order
 * @param insensitiveCase: insensitive case glob
 * @param isSubDir: if set true and paths is a folder function return stat info.
 *                  if set false return recurrent contain folder stats.
 * @returns {Promise} - array:  stats results files and folders.
 * @private
 */
function ls(paths, orders = [], orderAsc = true, isSubDir = true) {
  return new Promise((resolve, reject) => {
    if (paths.constructor !== Array) {
      paths = [paths];
    }

    const pathsLsPromises = [];
    paths.map(_path => {
      // If _ls paths input is the same that _curatePath output is not a curate path, return content.
      if (paths.indexOf(_path) !== -1) isSubDir = false;
      pathsLsPromises.push(lsAsync(_path, isSubDir));
    });

    Promise.all(pathsLsPromises)
      .then(values => {
        let res = [].concat(...values);
        if (orders?.length) res = lodash.sortBy(res, orders);
        if (!orderAsc) res = res.reverse();
        resolve(res);
      })
      .catch(err => {
        if (paths.length === 1 && isSubDir) {
          const res = [
            {
              file: paths[0].split(path.sep).pop(),
              path: paths[0],
              exists: 0
            }
          ];
          resolve(res);
        } else {
          reject(err);
        }
      });
  });
}

/**
 * Return async stats files and folders
 * @param file
 * @param isSubDir
 * @returns {Promise}
 */
function lsAsync(file, isSubDir = false) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stat) => {
      let res;
      if (err) {
        if (isSubDir) {
          res = {
            file: file.split(path.sep).pop(),
            path: file,
            exists: 0
          };
          resolve(res);
        } else {
          reject(err);
        }
      } else {
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
            isFile: stat.isFile() ? 1 : 0,
            isDirectory: stat.isDirectory() ? 1 : 0,
            exists: 1
          };
          resolve(res);
        } else {
          if (stat.isDirectory()) {
            _readdirAsync(file)
              .then(files => {
                const resPromises = [];
                files.map(f => {
                  resPromises.push(lsAsync(path.join(file, f), true));
                });

                Promise.all(resPromises).then(res => {
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

/**
 * Return folder content
 * @param path
 * @returns {Promise}
 * @private
 */
function _readdirAsync(path) {
  return new Promise((resolve, reject) => {
    if (path !== undefined) {
      fs.readdir(path, (err, list) => {
        if (err) {
          reject(err);
        } else {
          resolve(list);
        }
      });
    } else {
      reject('Undefined path');
    }
  });
}

module.exports = { ls };
