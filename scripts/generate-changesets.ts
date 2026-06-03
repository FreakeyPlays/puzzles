#!/usr/bin/env bun
// @ts-nocheck
/**
 * Generates Changesets from merged Conventional-Commit(s) on the default branch.
 *
 * Runs inside the Release workflow (before changesets/action) over the commits a
 * push introduced. Because we squash-merge, each PR is one commit whose message
 * is the PR title. The generated changeset files are consumed immediately by
 * `changeset version` and never committed to a branch — so nothing is ever
 * pushed back to your working branch.
 *
 * Bump level comes from the commit type:
 *   feat -> minor      fix | perf -> patch      "!" or "BREAKING CHANGE" -> major
 *   anything else (chore, docs, ci, test, build, refactor, style, ...) -> skipped
 *   (the "ci: version packages" merge isn't releasing, so it generates nothing)
 *
 * Affected packages are detected from each commit's changed files (path-based),
 * mapped against the *live* workspace — packages are discovered from the root
 * `workspaces` globs and each package's own `package.json`, never a hardcoded
 * list. Add, rename, or move a package and this keeps working with no edit here.
 * Packages without a `version`, or matched by the changeset config's `ignore`
 * list, are excluded. Inherited dependents cascade later via `workspace:*`
 * ranges (Changesets' `updateInternalDependencies`).
 *
 * Inputs (env):
 *   COMMIT_RANGE    "<before>..<after>" from the push event; falls back to the
 *                   single HEAD commit if unset/invalid (e.g. first push).
 *   COMMIT_SUBJECT  + CHANGED_FILES — override a single synthetic commit (local
 *                   testing); bypasses git entirely.
 */

import { execSync } from 'node:child_process';
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const BUMP_BY_TYPE = { feat: 'minor', fix: 'patch', perf: 'patch' };

const TESTING = process.env.COMMIT_SUBJECT != null;

function git(cmd) {
  return execSync(`git ${cmd}`, { encoding: 'utf8' }).trim();
}

/** Workspace package dirs, resolved from the root `workspaces` globs. */
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

/** Turn a changeset `ignore` entry ("@repo/*" or an exact name) into a matcher. */
function ignoreMatcher(patterns) {
  const regexes = (patterns ?? []).map(
    (p) =>
      new RegExp(
        `^${p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`,
      ),
  );
  return (name) => regexes.some((re) => re.test(name));
}

/**
 * Releasable packages as `{ prefix, name }`, where `prefix` is the package dir
 * relative to the repo root (POSIX-style, trailing slash). Sorted longest-first
 * so a changed file is attributed to the most specific (deepest) package.
 */
function releasablePackages() {
  const config = JSON.parse(
    readFileSync(join(repoRoot, '.changeset', 'config.json'), 'utf8'),
  );
  const isIgnored = ignoreMatcher(config.ignore);

  const pkgs = [];
  for (const dir of workspaceDirs()) {
    const pkgPath = join(dir, 'package.json');
    if (!existsSync(pkgPath)) continue;
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    if (!pkg.name || !pkg.version || isIgnored(pkg.name)) continue;

    const prefix = `${relative(repoRoot, dir).split(sep).join('/')}/`;
    pkgs.push({ prefix, name: pkg.name });
  }
  return pkgs.sort((a, b) => b.prefix.length - a.prefix.length);
}

function commits() {
  if (TESTING) return ['__test__'];
  const range = process.env.COMMIT_RANGE ?? '';
  const before = range.split('..')[0] ?? '';
  if (!range.includes('..') || /^0+$/.test(before))
    return [git('rev-parse HEAD')];
  try {
    const out = git(`rev-list --no-merges ${range}`);
    return out ? out.split('\n') : [];
  } catch {
    return [git('rev-parse HEAD')];
  }
}

function subjectOf(sha) {
  return TESTING
    ? process.env.COMMIT_SUBJECT
    : git(`show -s --format=%s ${sha}`);
}

function bodyOf(sha) {
  return TESTING
    ? (process.env.COMMIT_SUBJECT ?? '')
    : git(`show -s --format=%B ${sha}`);
}

function changedFilesOf(sha) {
  if (process.env.CHANGED_FILES != null) {
    return process.env.CHANGED_FILES.split('\n').filter(Boolean);
  }
  return git(`diff-tree --no-commit-id --name-only -r ${sha}`)
    .split('\n')
    .filter(Boolean);
}

const PACKAGES = releasablePackages();
if (PACKAGES.length === 0) {
  console.log('generate-changesets: no releasable workspace packages found.');
  process.exit(0);
}

let written = 0;
for (const sha of commits()) {
  const short = TESTING ? 'test' : sha.slice(0, 9);
  const subject = subjectOf(sha);

  const match = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/);
  if (!match) {
    console.log(`Skip ${short}: "${subject}" is not a Conventional Commit.`);
    continue;
  }

  const [, rawType, , bang, description] = match;
  const type = rawType.toLowerCase();
  const breaking = bang === '!' || /BREAKING[ -]CHANGE/.test(bodyOf(sha));
  const bump = breaking ? 'major' : BUMP_BY_TYPE[type];
  if (!bump) {
    console.log(`Skip ${short}: type "${type}" is non-releasing.`);
    continue;
  }

  const packages = new Set();
  for (const file of changedFilesOf(sha)) {
    const owner = PACKAGES.find((p) => file.startsWith(p.prefix));
    if (owner) packages.add(owner.name);
  }
  if (packages.size === 0) {
    console.log(`Skip ${short}: no releasable package paths changed.`);
    continue;
  }

  const frontmatter = [...packages].map((p) => `"${p}": ${bump}`).join('\n');
  const contents = `---\n${frontmatter}\n---\n\n${description.trim()}\n`;
  const path = `.changeset/auto-${short}.md`;
  writeFileSync(join(repoRoot, path), contents);
  written++;
  console.log(`Wrote ${path}:\n\n${contents}`);
}

console.log(`generate-changesets: done (${written} changeset(s) written).`);
