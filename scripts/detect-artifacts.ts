#!/usr/bin/env bun
// @ts-nocheck
/**
 * Emit release outputs for the workflow: per-kind booleans (used to gate the
 * toolchain-setup and build steps) plus a compact `manifest` JSON the build and
 * upload steps iterate. Reads `publishedPackages` from $PUBLISHED_PACKAGES and
 * appends `key=value` lines to $GITHUB_OUTPUT (prints them when run locally).
 */

import { appendFileSync } from 'node:fs';
import { resolveArtifacts, type ArtifactKind } from './release-artifacts';

const artifacts = resolveArtifacts(process.env.PUBLISHED_PACKAGES ?? '[]');
const has = (kind: ArtifactKind) => artifacts.some((a) => a.kind === kind);

const outputs: Record<string, string> = {
  has_crate: String(has('crate')),
  has_wasm: String(has('wasm')),
  has_apk: String(has('apk')),
  manifest: JSON.stringify(artifacts),
};

const lines =
  Object.entries(outputs)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, lines);
else process.stdout.write(lines);

for (const a of artifacts)
  console.log(
    `detect-artifacts: ${a.name}@${a.version} -> ${a.kind} (${a.dir})`,
  );
