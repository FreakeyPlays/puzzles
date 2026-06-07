---
title: Getting Started
description: Prerequisites, install steps, and common dev commands for the Puzzles monorepo
---

## Prerequisites

| Tool                                | Version | Install                                                           |
| ----------------------------------- | ------- | ----------------------------------------------------------------- |
| [Bun](https://bun.sh)               | 1.3.13  | `curl -fsSL https://bun.sh/install \| bash`                       |
| [Node.js](https://nodejs.org)       | ≥ 24    | Via `nvm` or direct download                                      |
| [Rust toolchain](https://rustup.rs) | stable  | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |

After installing Rust, add the WASM target:

```sh
rustup target add wasm32-unknown-unknown
```

## Install dependencies

```sh
bun install
```

This installs all workspace packages in one pass. Bun also builds `sudoku-wasm` automatically because the Angular app depends on it.

## Common commands

All commands run from the **repo root** via Turbo. Turbo handles task ordering — you never need to `cd` into individual packages.

| Command               | What it does                                        |
| --------------------- | --------------------------------------------------- |
| `bun dev`             | Run all packages in watch mode                      |
| `bun build`           | Build every app and package (Rust → WASM → Angular) |
| `bun test`            | Run all test suites                                 |
| `bun run lint`        | Lint all code (TypeScript + Rust)                   |
| `bun run format`      | Format all files via Prettier                       |
| `bun run check-types` | TypeScript type check across all packages           |

To target a single package, use the `--filter` flag:

```sh
bun dev --filter=sudoku-web   # Angular dev server only
bun dev --filter=docs         # Starlight docs site only
bun build --filter=sudoku-wasm  # Rebuild Rust → WASM only
```

## How to use these docs

The sidebar has three main sections:

**Repository** — monorepo tooling, CI/CD, how packages relate to each other. Start here if you're onboarding or setting up the project.

**Sudoku** — everything specific to the Sudoku puzzle: the Rust core (`sudoku-core`), the WASM bindings (`sudoku-wasm`), and the web app (`sudoku-web`). Each layer has its own sub-section.

The docs are specification-first — they describe the intended architecture, including parts that are not yet implemented. Pages note when something is a plan rather than existing code.
