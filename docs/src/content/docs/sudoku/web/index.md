---
title: Web App
description: Overview of the sudoku-web Angular application
---

`apps/sudoku-web` is an Angular 22 PWA that runs entirely in the browser — no server required.

## Key Architecture Decisions

**WASM runs in a Web Worker.** The Rust solver and generator run in a dedicated worker (`sudoku.worker.ts`) so they never block the main thread. The `SudokuService` communicates with the worker via a typed message protocol.

**No solution in LocalStorage.** The solution is kept in memory only. On app restart, `solve(puzzle)` is called to recompute it. This prevents trivial cheating via DevTools.

**Seed-based reproducibility.** Every puzzle has a `seed` + `difficulty` that uniquely identifies it, enabling the future Challenge Mode.

## Package Structure

```
apps/sudoku-web/src/app/
  sudoku/
    worker-protocol.ts   ← typed message contract between service and worker
    sudoku.worker.ts     ← Web Worker: loads WASM, dispatches calls
    sudoku.service.ts    ← Angular service: wraps worker as Promise-based API
```
