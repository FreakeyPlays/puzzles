#!/usr/bin/env bun
// @ts-nocheck
/**
 * Sync each TWA app's manifest version to its package.json version.
 *
 * Changesets only bumps `package.json` versions. For an app that is also a TWA
 * (it has a `twa/twa-manifest.json`), the version Bubblewrap stamps into the APK
 * comes from that manifest, which Changesets never touches.
 *
 * Bubblewrap reads the version *name* from the `appVersion` field (not the
 * `appVersionName` it also writes — that one is a write-only echo it ignores on
 * load), and the integer `appVersionCode` for Android's versionCode. We set
 * `appVersion` (the field that matters) to the semver string, keep
 * `appVersionName` in sync so the committed file isn't self-contradictory, and
 * derive `appVersionCode` as a monotonic integer (maj*10000 + min*100 + pat) so
 * every release ships a strictly increasing code — which Google Play requires
 * and rejects duplicates of.
 *
 * Run this right after `changeset version` (see the `changeset:version` script)
 * so the bumped manifest is committed to the Version Packages PR; the later
 * `bubblewrap build` then reads the version straight from source control.
 *
 * Alongside the manifest we also rewrite `manifest-checksum.txt`. Bubblewrap's
 * `build` stores that file (a plain SHA-1 of the manifest's bytes) and compares
 * it to the live manifest to decide whether the project is stale. `bubblewrap
 * update` is what normally regenerates it — but `update` needs the JDK/Android
 * SDK and prompts when they're absent, so it can't run in the version step
 * (which has no toolchain). Since the checksum is just `sha1(manifest bytes)`,
 * we reproduce it directly and keep the committed manifest/checksum pair in
 * sync; `build:android` still runs `update` later (with the toolchain present)
 * to regenerate the Gradle project itself.
 */

import { createHash } from 'node:crypto';
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function workspaceDirs() {
  const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
  const globs = pkg.workspaces ?? [];
  const dirs = [];
  for (const glob of globs) {
    if (glob.endsWith('/*')) {
      const base = join(repoRoot, glob.slice(0, -2));
      if (!existsSync(base)) continue;
      for (const entry of readdirSync(base)) {
        const full = join(base, entry);
        if (statSync(full).isDirectory()) dirs.push(full);
      }
    } else {
      const full = join(repoRoot, glob);
      if (existsSync(full)) dirs.push(full);
    }
  }
  return dirs;
}

function versionCode(version: string): number {
  const [maj = 0, min = 0, pat = 0] = version.split('.').map(Number);
  return maj * 10000 + min * 100 + pat;
}

const apps = [];
for (const dir of workspaceDirs()) {
  const pkgPath = join(dir, 'package.json');
  const manifestPath = join(dir, 'twa', 'twa-manifest.json');
  if (!existsSync(pkgPath) || !existsSync(manifestPath)) continue;

  const version = JSON.parse(readFileSync(pkgPath, 'utf8')).version;
  if (!version) continue;

  apps.push({ manifestPath, version });
}

if (apps.length === 0) {
  console.log('bump-apk-versions: no TWA apps found, nothing to do.');
  process.exit(0);
}

let touched = 0;
for (const { manifestPath, version } of apps) {
  const code = versionCode(version);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (
    manifest.appVersion === version &&
    manifest.appVersionName === version &&
    manifest.appVersionCode === code
  ) {
    continue;
  }
  manifest.appVersion = version;
  manifest.appVersionName = version;
  manifest.appVersionCode = code;

  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(manifestPath, serialized);
  const checksumPath = join(dirname(manifestPath), 'manifest-checksum.txt');
  writeFileSync(
    checksumPath,
    createHash('sha1').update(serialized).digest('hex'),
  );

  console.log(
    `bump-apk-versions: ${manifestPath.replace(`${repoRoot}/`, '')} -> appVersion=${version} appVersionCode=${code}`,
  );
  touched++;
}

console.log(
  `bump-apk-versions: done (${touched} manifest(s) updated, ${apps.length} app(s) verified).`,
);
