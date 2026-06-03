#!/usr/bin/env bun
// @ts-nocheck
/**
 * Shared resolver: map Changesets' `publishedPackages` output to the build
 * artifacts each package produces.
 *
 * Changesets reports *which* workspace packages were tagged (name + version).
 * Every place in the release workflow that acts per-package — detecting which
 * toolchains to set up, building crates/wasm/APKs, and uploading assets to the
 * GitHub Release — needs the same two facts: where the package lives and what
 * kind of artifact it builds. This module is the single source of truth for that
 * mapping so the workflow steps no longer each re-derive it in shell.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

export type ArtifactKind = 'crate' | 'wasm' | 'apk';

export interface Artifact {
  name: string;
  version: string;
  dir: string;
  kind: ArtifactKind;
}

interface PublishedPackage {
  name: string;
  version: string;
}

function classify(absDir: string): ArtifactKind | null {
  if (existsSync(join(absDir, 'twa'))) return 'apk';
  const cargoPath = join(absDir, 'Cargo.toml');
  if (!existsSync(cargoPath)) return null;
  return /wasm-bindgen/.test(readFileSync(cargoPath, 'utf8'))
    ? 'wasm'
    : 'crate';
}

export function resolveArtifacts(publishedPackagesJson: string): Artifact[] {
  const published: PublishedPackage[] = JSON.parse(
    publishedPackagesJson || '[]',
  );
  const artifacts: Artifact[] = [];
  for (const { name, version } of published) {
    for (const base of ['apps', 'packages']) {
      const dir = join(base, name);
      if (!existsSync(join(repoRoot, dir))) continue;
      const kind = classify(join(repoRoot, dir));
      if (kind) artifacts.push({ name, version, dir, kind });
      break;
    }
  }
  return artifacts;
}

export function resolveAsset(artifact: Artifact): string | null {
  const absDir = join(repoRoot, artifact.dir);
  switch (artifact.kind) {
    case 'apk': {
      const apk = join(absDir, 'twa', 'app-release-signed.apk');
      return existsSync(apk) ? apk : null;
    }
    case 'wasm':
      return firstMatch(absDir, (f) => f.endsWith('.tgz'));
    case 'crate':
      return firstMatch(join(absDir, 'target', 'package'), (f) =>
        f.endsWith('.crate'),
      );
  }
}

function firstMatch(
  dir: string,
  pred: (file: string) => boolean,
): string | null {
  if (!existsSync(dir)) return null;
  const match = readdirSync(dir).sort().find(pred);
  return match ? join(dir, match) : null;
}
