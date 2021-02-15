const fs = require("fs/promises");

async function mv(inputPaths, destinationPath) {
  for (const fromPath of inputPaths) {
    await fs.rename(fromPath, destinationPath);
  }
}

module.exports = { mv };
