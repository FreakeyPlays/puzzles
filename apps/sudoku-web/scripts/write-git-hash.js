const { execSync } = require('child_process');
const { writeFileSync } = require('fs');
const { join } = require('path');

const hash = process.env.GIT_HASH || (() => {
  try { return execSync('git rev-parse --short HEAD').toString().trim(); } catch { return ''; }
})();

writeFileSync(
  join(__dirname, '../src/environments/git-hash.json'),
  JSON.stringify({ hash }) + '\n',
);
