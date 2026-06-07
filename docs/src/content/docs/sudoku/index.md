---
title: Sudoku
description: Overview of the Sudoku puzzle implementation — Rust core, WASM bindings, and Angular web app
---

Sudoku is a number placement puzzle played on a 9×9 grid divided into nine 3×3 boxes. The goal is to fill every cell so that each row, each column, and each box contains the digits 1–9 exactly once. A well-formed puzzle has exactly one solution.

## Implementation layers

The Sudoku implementation is split across three packages:

| Package                | Language                | Role                                      |
| ---------------------- | ----------------------- | ----------------------------------------- |
| `packages/sudoku-core` | Rust                    | Solver, generator, validator, hint engine |
| `packages/sudoku-wasm` | Rust + `wasm-bindgen`   | Exposes `sudoku-core` to JavaScript       |
| `apps/sudoku-web`      | TypeScript / Angular 22 | PWA frontend — UI, state, persistence     |

The Rust layer runs in a **Web Worker** so it never blocks the main thread. `SudokuService` bridges the Angular app to the worker via a typed message protocol.

## Board format

Boards are represented as an 81-character string. Cells are ordered left-to-right, top-to-bottom. Unknowns are `'0'`.

```
530070000600195000098000060800060003400803001700020006060000280000419005000080079
```

See [WASM API](./core/wasm-api) for the full function signatures that operate on this format.

## Puzzle lifecycle

Each puzzle moves through three statuses:

| Status        | Meaning                                      |
| ------------- | -------------------------------------------- |
| `in_progress` | The user is actively playing                 |
| `solved`      | The board matches the solution               |
| `abandoned`   | The user started a new game before finishing |

The app state machine (`idle → loading → playing ↔ paused`) wraps this lifecycle. See [App State Machine](./web/app-state) for the full transition diagram.

## Sections

- **[Core](./core/)** — Rust crate internals: data structures, solver algorithm, generator strategy
- **[Web App](./web/)** — Angular PWA: architecture, services, state machine, persistence, routing
