# Puzzles

A monorepo for installable puzzle apps. Each puzzle's logic is written in **Rust
and compiled to WebAssembly** for native-speed solving and generation in the
browser. Each puzzle gets its own **frontend** that ships as a PWA and an Android
TWA (and possibly iOS or other targets later).

The repo is named `puzzles`
because the long-term idea is a family of these apps, and eventually a single
combined app that bundles them together. Those are directions, not commitments.
For now everything here serves Sudoku.

## Structure

This is a [Turborepo](https://turborepo.dev) monorepo managed with
[Bun](https://bun.sh).

| Package                      | Description                                                               |
| ---------------------------- | ------------------------------------------------------------------------- |
| `apps/*-web`                 | A puzzle's frontend (e.g. `sudoku-web`)                                   |
| `packages/*-core`            | Rust crate with a puzzle's core logic (e.g. `sudoku-core`)                |
| `packages/*-wasm`            | WebAssembly bindings exposing a `*-core` crate to JS (e.g. `sudoku-wasm`) |
| `packages/eslint-config`     | Shared ESLint config                                                      |
| `packages/typescript-config` | Shared `tsconfig` bases                                                   |
| `docs`                       | Astro [Starlight](https://starlight.astro.build) documentation site       |

The intended shape for every puzzle is the same: a Rust core crate → WASM
bindings → one frontend app under `apps/`.

## Getting started

Requires [Bun](https://bun.sh), [Node](https://nodejs.org) >= 24, and the
[Rust toolchain](https://rustup.rs).

```sh
bun install      # install dependencies
bun dev          # run everything in watch mode
bun build        # build all apps and packages
bun test         # run tests
```

To work on just the web app: `bun dev --filter=sudoku-web`. For the docs site:
`bun dev --filter=docs`.

## Environment variables

CI doesn't store any deploy/signing values as GitHub repository secrets. They
live in **[Bitwarden Secret Manager](https://bitwarden.com/products/secrets-manager/)**
and are injected at runtime by the [`bitwarden/sm-action`](https://github.com/bitwarden/sm-action)
step in each workflow (referenced by their Bitwarden secret IDs, see the
`secrets:` blocks in `.github/workflows/`).

**The only GitHub repository secret you set is `BW_ACCESS_TOKEN`**, a Bitwarden
Secret Manager machine-account access token. With that in place, the workflows
fetch everything else themselves. (`GITHUB_TOKEN` is provided automatically by
Actions, so you don't set it.)

The variables that must exist in Bitwarden:

| Variable                    | Needed for                    | Notes                                                                                        |
| --------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`      | Web deploy (Cloudflare Pages) | API token with the _Pages: Edit_ permission.                                                 |
| `CLOUDFLARE_ACCOUNT_ID`     | Web deploy                    | Your Cloudflare account id.                                                                  |
| `ANDROID_KEYSTORE_BASE64`   | Android APK build             | base64 of the signing keystore. Also the on/off switch: without it the APK build is skipped. |
| `ANDROID_KEY_ALIAS`         | Android APK build             | Key alias inside the keystore (e.g. `puzzles`).                                              |
| `ANDROID_KEYSTORE_PASSWORD` | Android APK build             | Keystore (store) password.                                                                   |
| `ANDROID_KEY_PASSWORD`      | Android APK build             | Key password (often the same as the store password).                                         |

The Android keystore values are **shared across all apps** (one upload key, one
fingerprint), so adding a new puzzle app needs no new variables.

> [!IMPORTANT]
> **Generating the keystore.** Use `keytool` directly, not `bubblewrap init`.
> Bubblewrap generates a keystore tied to a specific app package name, which
> breaks the shared-key model (one fingerprint across all apps in this repo).
> `keytool` gives you a plain, app-agnostic keystore you can reuse everywhere:
>
> ```sh
> keytool -genkeypair -keystore puzzles.keystore -alias puzzles -keyalg RSA -keysize 2048 -validity 9125 -storetype JKS
> ```
>
> Then base64-encode it (`base64 -w0 puzzles.keystore`) and store the result as
> `ANDROID_KEYSTORE_BASE64` in Bitwarden, alongside the alias and passwords.

## Setup a new frontend

Each frontend lives in `apps/<name>` and rides the same CI: the `Deploy`
workflow runs its `publish:web`, and the `Release` workflow builds its signed
Android APK. Signing secrets are **shared across all apps** (one upload key, see
_Environment variables_), so a new app needs **no new secrets**. Order matters,
the site must be live before Bubblewrap can read its manifest:

1. **Create the app** at `apps/<name>` (an Angular PWA) and copy these two CI
   scripts into its `package.json`, swapping `<name>`:

   ```jsonc
   "build:android": "cd twa && bunx @bubblewrap/cli@1.24.1 update --skipVersionUpgrade && bunx @bubblewrap/cli@1.24.1 build --skipPwaValidation --signingKeyPath \"$ANDROID_KEYSTORE_PATH\" --signingKeyAlias \"$ANDROID_KEY_ALIAS\" < /dev/null",
   "publish:web": "wrangler pages deploy <dist/out/build/...> --project-name=<name> --branch=${DEPLOY_BRANCH:-main}"
   ```

2. **Create the Cloudflare Pages project** (its name must match `--project-name`),
   then attach the custom domain (DNS + cert) in the Cloudflare dashboard:

   ```sh
   bunx wrangler pages project create <name> --production-branch main
   ```

3. **Deploy, and wait until it's live.** Push to `main` (or `bun run
--filter=<name> publish:web`) and confirm `https://<domain>/manifest.webmanifest`
   returns 200. The next step reads the **live** manifest.

4. **Scaffold the TWA** with Bubblewrap. When prompted, use **reverse-domain +
   `.twa`** as the package id (e.g. `chess.you.dev` → `dev.you.chess.twa`) and
   **reuse the existing keystore** (shared upload key → shared fingerprint):

   ```sh
   cd apps/<name>
   bunx @bubblewrap/cli@1.24.1 init --manifest https://<domain>/manifest.webmanifest --directory twa
   ```

   Then set `twa/twa-manifest.json` → `signingKey.path` to `./puzzles.keystore`
   and commit `twa-manifest.json` (keystore + build outputs stay gitignored).

5. **Asset links.** In `apps/<name>/public/.well-known/assetlinks.json`, set
   `package_name` to the package id and reuse the **same upload-key SHA-256** the
   other apps use. It's the shared key, so just copy the fingerprint from another
   app's `assetlinks.json`. Redeploy. After the first Play upload, add Google's
   Play App Signing fingerprint (Play Console → _Setup → App integrity_) as a
   second entry. (`keytool -list -v -keystore apps/sudoku-web/twa/puzzles.keystore -alias puzzles | grep "SHA256:"`)
