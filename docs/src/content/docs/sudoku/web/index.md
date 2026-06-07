---
title: Web App
description: Overview of the sudoku-web Angular application
---

`apps/sudoku-web` is an Angular 22 PWA that runs entirely in the browser — no server required.

## Key Architecture Decisions

**WASM runs in a Web Worker.** The Rust solver and generator run in a dedicated worker so they never block the main thread. `SudokuService` communicates with the worker via a typed message protocol.

**No solution in LocalStorage.** The solution is kept in memory only. On app restart, `solve(puzzle)` is called to recompute it. This prevents trivial cheating via DevTools.

**Seed-based reproducibility.** Every puzzle has a `seed` + `difficulty` that uniquely identifies it, enabling the future Challenge Mode.

**Standalone components + Signals.** No NgModules. All state is managed with Angular Signals. See [Architecture](./architecture) for the full folder structure and component patterns.

**Five services, one orchestrator.** `AppService` drives all state transitions. `GameService`, `StorageService`, `VisibilityService`, and `SudokuService` are coordinated by it. See [Services](./services) for the full dependency graph and public APIs.
