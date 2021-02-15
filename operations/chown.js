const fs = require("fs/promises");

async function chown(paths, uid, guid) {
  for (const path of paths) {
    await fs.chown(path, uid, guid);
  }
}

module.exports = { chown };
