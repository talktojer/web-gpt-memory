const fs = require('fs-extra');
const path = require('path');

async function loadContext(token) {
  const sessionPath = path.join(__dirname, '../sessions', `${token}.json`);
  let context = [];
  if (fs.existsSync(sessionPath)) {
    const fileContent = await fs.promises.readFile(sessionPath, 'utf-8');
    context = JSON.parse(fileContent);
  }
  return context;
}

module.exports = {
  loadContext
};
