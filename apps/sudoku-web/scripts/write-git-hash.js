const { execSync } = require('child_process');
const { writeFileSync } = require('fs');
const { join } = require('path');

let hash = 'dev';
try {
  hash = execSync('git rev-parse --short HEAD').toString().trim();
} catch {}

writeFileSync(
  join(__dirname, '../src/environments/git-hash.json'),
  JSON.stringify({ hash }) + '\n',
);
