const fs = require('fs/promises');

async function symlink(srcPath, dstPath) {
  await fs.symlink(srcPath, dstPath);
}

module.exports = { symlink };
