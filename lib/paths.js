const glob = require('glob');
const util = require('util');
const globPromise = util.promisify(glob);

/**
 * Return array with all coincident glob result from path or paths input
 * @param path
 * @param insensitiveCase
 * @returns {Promise} - array
 * @private
 */
async function resolveGlobPaths(paths, insensitiveCase = true) {
  if (paths.constructor !== Array) {
    paths = [paths];
  }

  const resolvedPaths = [];

  for (const globbedPath of paths) {
    const resolvedPath = await globPromise(globbedPath, insensitiveCase);
    resolvedPaths.push(...resolvedPath);
  }

  return resolvedPaths;
}

module.exports = { resolveGlobPaths };
