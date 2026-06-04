# puzzles

Monorepo for Puzzle PWAs. Sudoku is the only puzzle for now, but will be extended in the future for more games.

## Stack

- **bun** workspaces + **turbo**. Run tasks from the root: `bun run <script>`.
- `apps/*-web` — Frontend for the Puzzle game.
  - `apps/sudoku-web` — Angular 22, Tailwind v4, Vitest, service-worker (PWA)
- `packages/*-core` (Rust) → `packages/*-wasm` (WASM). Solver logic lives in Rust, not TS.

## Notes

- `apps/*-web/twa` is a generated Bubblewrap Android wrapper — build artifacts, don't hand-edit.
