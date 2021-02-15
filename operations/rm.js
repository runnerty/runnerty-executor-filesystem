const fs = require('fs-extra');

async function rm(paths) {
  for (const path of paths) {
    await fs.remove(path);
  }
}

module.exports = { rm };
