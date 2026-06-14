const { execSync, spawnSync } = require('child_process');

let hash = '';
try {
  hash = execSync('git rev-parse --short HEAD').toString().trim();
} catch {}

const result = spawnSync(
  'node_modules/.bin/ng',
  ['build', `--define.__GIT_HASH__=${JSON.stringify(hash)}`],
  { stdio: 'inherit', shell: true },
);

process.exit(result.status ?? 1);
