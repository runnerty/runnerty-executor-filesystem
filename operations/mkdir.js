const fs = require('fs-extra');

/**
 * Return array with all dirs created or reject with error.
 * If dir exists return null into te array.
 * @param path
 * @returns {Promise} - array
 * @private
 */
function mkdir(paths) {
  return new Promise((resolve, reject) => {
    if (paths.constructor !== Array) {
      paths = [paths];
    }

    const pathsEnsureDirPromises = [];
    paths.map(_path => {
      pathsEnsureDirPromises.push(fs.ensureDir(_path));
    });

    Promise.all(pathsEnsureDirPromises)
      .then(values => {
        const res = [].concat(...values);
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

module.exports = { mkdir };
