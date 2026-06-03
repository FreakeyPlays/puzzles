#!/usr/bin/env bun
// @ts-nocheck
/**
 * Sync Cargo crate versions to their package.json version.
 *
 * Changesets only bumps `package.json` versions. For workspace packages that are
 * also Rust crates (they have both `package.json` and `Cargo.toml`), the version
 * that `cargo package` stamps into the published `.crate` comes from `Cargo.toml`,
 * which Changesets never touches. Without this step the git tag (e.g.
 * `sudoku-core@1.3.0`) and the actual crate version (still `1.0.0`) silently drift.
 *
 * Run this right after `changeset version` (see the `changeset:version` script).
 * It copies each crate's `package.json` version into its `Cargo.toml` and updates
 * the matching `[[package]]` entry in every `Cargo.lock` so the lockfiles stay in
 * sync (including cross-references, e.g. sudoku-wasm depending on sudoku-core).
 */

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

function setCargoTomlVersion(toml: string, version: string) {
  const lines = toml.split('\n');
  let inPackage = false;
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const header = lines[i].match(/^\s*\[([^\]]+)]\s*$/);
    if (header) {
      inPackage = header[1].trim() === 'package';
      continue;
    }
    if (inPackage && /^\s*version\s*=/.test(lines[i])) {
      const next = lines[i].replace(
        /version\s*=\s*"[^"]*"/,
        `version = "${version}"`,
      );
      if (next !== lines[i]) {
        lines[i] = next;
        changed = true;
      }
      break;
    }
  }
  return { text: lines.join('\n'), changed };
}

function setCargoLockVersions(lock: string, versions: Map<string, string>) {
  const lines = lock.split('\n');
  let currentName = null;
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*\[\[package]]\s*$/.test(lines[i])) {
      currentName = null;
      continue;
    }
    const nameMatch = lines[i].match(/^\s*name\s*=\s*"([^"]+)"/);
    if (nameMatch) {
      currentName = nameMatch[1];
      continue;
    }
    if (
      currentName &&
      versions.has(currentName) &&
      /^\s*version\s*=/.test(lines[i])
    ) {
      const next = lines[i].replace(
        /version\s*=\s*"[^"]*"/,
        `version = "${versions.get(currentName)}"`,
      );
      if (next !== lines[i]) {
        lines[i] = next;
        changed = true;
      }
    }
  }
  return { text: lines.join('\n'), changed };
}

const crateDirs = [];
const crateVersions = new Map();
for (const dir of workspaceDirs()) {
  const pkgPath = join(dir, 'package.json');
  const cargoPath = join(dir, 'Cargo.toml');
  if (!existsSync(pkgPath) || !existsSync(cargoPath)) continue;

  const version = JSON.parse(readFileSync(pkgPath, 'utf8')).version;
  const cargoName = readFileSync(cargoPath, 'utf8').match(
    /^\s*name\s*=\s*"([^"]+)"/m,
  )?.[1];
  if (!version || !cargoName) continue;

  crateDirs.push({ dir, cargoPath, version });
  crateVersions.set(cargoName, version);
}

if (crateDirs.length === 0) {
  console.log(
    'sync-cargo-versions: no Rust workspace crates found, nothing to do.',
  );
  process.exit(0);
}

let touched = 0;
for (const { cargoPath, version } of crateDirs) {
  const { text, changed } = setCargoTomlVersion(
    readFileSync(cargoPath, 'utf8'),
    version,
  );
  if (changed) {
    writeFileSync(cargoPath, text);
    console.log(
      `sync-cargo-versions: ${cargoPath.replace(`${repoRoot}/`, '')} -> ${version}`,
    );
    touched++;
  }
}

for (const { dir } of crateDirs) {
  const lockPath = join(dir, 'Cargo.lock');
  if (!existsSync(lockPath)) continue;
  const { text, changed } = setCargoLockVersions(
    readFileSync(lockPath, 'utf8'),
    crateVersions,
  );
  if (changed) {
    writeFileSync(lockPath, text);
    console.log(
      `sync-cargo-versions: ${lockPath.replace(`${repoRoot}/`, '')} updated`,
    );
    touched++;
  }
}

const drift = [];
for (const { cargoPath, version } of crateDirs) {
  const lines = readFileSync(cargoPath, 'utf8').split('\n');
  let inPackage = false;
  let found = null;
  for (const line of lines) {
    const header = line.match(/^\s*\[([^\]]+)]\s*$/);
    if (header) {
      inPackage = header[1].trim() === 'package';
      continue;
    }
    if (inPackage) {
      const m = line.match(/^\s*version\s*=\s*"([^"]*)"/);
      if (m) {
        found = m[1];
        break;
      }
    }
  }
  if (found !== version) {
    drift.push(
      `${cargoPath.replace(`${repoRoot}/`, '')}: expected "${version}", found ${found === null ? '<no version in [package]>' : `"${found}"`}`,
    );
  }
}

if (drift.length > 0) {
  console.error(
    'sync-cargo-versions: FAILED — Cargo.toml version(s) out of sync:',
  );
  for (const d of drift) console.error(`  - ${d}`);
  process.exit(1);
}

console.log(
  `sync-cargo-versions: done (${touched} file(s) updated, ${crateDirs.length} crate(s) verified).`,
);
