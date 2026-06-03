#!/usr/bin/env bun
// @ts-nocheck
/**
 * Attach build artifacts to the GitHub Release for each published package.
 *
 * `changeset publish` creates the git tags but neither GitHub Releases nor the
 * binaries. For each tagged package we ensure a release exists on its tag (as a
 * draft first), upload the built asset, then publish the release so it and its
 * asset appear together. Reads `publishedPackages` from $PUBLISHED_PACKAGES;
 * requires `gh` with $GITHUB_TOKEN in the environment.
 *
 * If a tagged package has no built asset we fail (non-zero exit) rather than
 * leaving a tag with an empty release — the partial-release case that otherwise
 * passes silently and never re-triggers.
 */

import { spawnSync } from 'node:child_process';
import { resolveArtifacts, resolveAsset } from './release-artifacts';

function gh(args: string[], { check = false, quiet = false } = {}): number {
  const res = spawnSync('gh', args, { stdio: quiet ? 'ignore' : 'inherit' });
  if (check && res.status !== 0) {
    throw new Error(`gh ${args.join(' ')} failed with status ${res.status}`);
  }
  return res.status ?? 1;
}

const artifacts = resolveArtifacts(process.env.PUBLISHED_PACKAGES ?? '[]');

let uploaded = 0;
const missing: string[] = [];

for (const artifact of artifacts) {
  const tag = `${artifact.name}@${artifact.version}`;
  const asset = resolveAsset(artifact);
  if (!asset) {
    missing.push(`${tag} (${artifact.kind})`);
    continue;
  }
  const exists = gh(['release', 'view', tag], { quiet: true }) === 0;
  if (!exists) {
    gh(
      [
        'release',
        'create',
        tag,
        '--verify-tag',
        '--draft',
        '--title',
        tag,
        '--notes',
        `Automated release for ${tag}`,
      ],
      { check: true },
    );
  }
  gh(['release', 'upload', tag, asset, '--clobber'], { check: true });
  gh(['release', 'edit', tag, '--draft=false'], { check: true });
  console.log(`upload-release-artifacts: ${tag} <- ${asset}`);
  uploaded++;
}

if (missing.length > 0) {
  console.error('upload-release-artifacts: FAILED — no built asset for:');
  for (const m of missing) console.error(`  - ${m}`);
  process.exit(1);
}

console.log(`upload-release-artifacts: done (${uploaded} asset(s) uploaded).`);
