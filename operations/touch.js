const fs = require("fs-extra");

async function touch(paths) {
  for (const fromPath of paths) {
    await fs.ensureFile(fromPath);
  }
}

module.exports = { touch };
