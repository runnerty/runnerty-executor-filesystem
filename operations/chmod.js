const fs = require('fs/promises');

async function chmod(paths, permissionsMode) {
  for (const path of paths) {
    await fs.chmod(path, permissionsMode);
  }
}

module.exports = { chmod };
