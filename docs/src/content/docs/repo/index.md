---
title: Repository
description: Monorepo structure, tooling, CI/CD, and release pipeline for the Puzzles project
---

This is a [Turborepo](https://turborepo.dev) monorepo managed with [Bun](https://bun.sh).

## Package layout

| Package                      | Type            | Description                                            |
| ---------------------------- | --------------- | ------------------------------------------------------ |
| `apps/sudoku-web`            | Angular PWA     | The Sudoku web app — the only frontend for now         |
| `packages/sudoku-core`       | Rust library    | Pure puzzle logic: solver, generator, validator        |
| `packages/sudoku-wasm`       | WASM bindings   | Exposes `sudoku-core` to JavaScript via `wasm-bindgen` |
| `packages/eslint-config`     | Shared config   | ESLint rule sets used by all TypeScript packages       |
| `packages/typescript-config` | Shared config   | `tsconfig` base files used by all TypeScript packages  |
| `docs`                       | Astro Starlight | This documentation site                                |

The intended shape for every puzzle is the same: a Rust core crate → WASM bindings → one frontend app under `apps/`. When a second puzzle is added, it will follow the same pattern: `<name>-core` → `<name>-wasm` → `apps/<name>-web`.

## Tooling

**Bun** is the package manager and script runner. All commands in the repo run via `bun run <script>` from the root.

**Turbo** orchestrates tasks across packages. It understands the dependency graph — `bun build` knows to build `sudoku-core` → `sudoku-wasm` → `sudoku-web` in the right order, and caches outputs between runs.

**Changesets** manages versioning. A `.changeset/*.md` file describes what changed; `bun run changeset:version` bumps the affected package versions (in `package.json`, `Cargo.toml`, and Android manifests simultaneously).

## CI/CD

There are three GitHub Actions workflows:

### ci.yml

Runs on every pull request to `main` and on every push to `main` (unless the commit message starts with `ci:`).

Steps: type-check → lint → format-check → test → build.

### deploy.yml

Runs on every push to `main`. Deploys the web app to **Cloudflare Pages** by running `bun turbo run publish:web`.

### release.yml

Runs on every push to `main`. Automatically generates changesets from commit messages, creates a Release PR to bump versions, and on merge builds and uploads release artifacts:

- Rust crates (`cargo package`)
- WASM npm packages (`wasm-pack build` + `npm pack`)
- Signed Android APKs (via Bubblewrap)

## Secrets

All secrets live in **[Bitwarden Secret Manager](https://bitwarden.com/products/secrets-manager/)**, not in GitHub repository secrets. The only GitHub secret is `BW_ACCESS_TOKEN` — a machine-account token that lets the workflows fetch everything else.

| Secret                      | Used by                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`      | `deploy.yml` — Cloudflare Pages deploy                                                    |
| `CLOUDFLARE_ACCOUNT_ID`     | `deploy.yml` — Cloudflare Pages deploy                                                    |
| `ANDROID_KEYSTORE_BASE64`   | `release.yml` — APK signing. Also the on/off switch: without it the APK build is skipped. |
| `ANDROID_KEY_ALIAS`         | `release.yml` — APK signing                                                               |
| `ANDROID_KEYSTORE_PASSWORD` | `release.yml` — APK signing                                                               |
| `ANDROID_KEY_PASSWORD`      | `release.yml` — APK signing                                                               |

The Android keystore is **shared across all apps** — a new puzzle app needs no new secrets.

## Shared configs

### typescript-config

`packages/typescript-config` exports two base configs:

- `base.json` — strict TypeScript, ES2022 target
- `angular.json` — extends `base.json`, adds Angular-specific settings (decorators, DOM libs)

All TypeScript packages extend one of these via `"extends": "@repo/typescript-config/..."`.

### eslint-config

`packages/eslint-config` exports two rule sets:

- `base` — `@eslint/js` + `typescript-eslint` + Prettier
- `angular` — extends `base`, adds `angular-eslint` rules

## Git hooks

Husky runs `lint-staged` before every commit:

| Files matched                    | Checks                       |
| -------------------------------- | ---------------------------- |
| `apps/sudoku-web/**/*.{ts,html}` | ESLint + Prettier            |
| `packages/**/*.rs`               | `cargo clippy` + `cargo fmt` |
| `*.{ts,html,json,css,md}` (root) | Prettier                     |

## Adding a new puzzle

See the [README](https://github.com/freakeyplays/puzzles#setup-a-new-frontend) for the full step-by-step: create the app, set up Cloudflare Pages, deploy, scaffold the TWA with Bubblewrap, and configure asset links. No new CI secrets are needed — the shared keystore covers all apps.
