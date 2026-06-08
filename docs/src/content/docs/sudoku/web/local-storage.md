---
title: Local Storage
description: LocalStorage schema for game state persistence
---

The app uses two separate LocalStorage keys. Settings are not yet implemented.

## Keys

| Key             | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| `sudoku:app`    | App-level phase — controls what the start screen shows |
| `sudoku:puzzle` | Active puzzle state — persists across page reloads     |

---

## `sudoku:app`

Controls what the home screen shows and remembers the last selected difficulty.

```typescript
type AppState = {
  phase: "idle" | "playing" | "paused";
  lastDifficulty: Difficulty; // pre-selected in the difficulty modal
};
```

| Field   | Values      | Meaning                                                           |
| ------- | ----------- | ----------------------------------------------------------------- |
| `phase` | `'idle'`    | No active game — show **Start Game**                              |
| `phase` | `'playing'` | Active game, timer was running — show **Continue** + **New Game** |
| `phase` | `'paused'`  | Active game, timer was stopped — show **Continue** + **New Game** |

`loading` is a runtime-only state and is never written here. If the app is killed during puzzle generation, `phase` remains `'idle'`.

See [App State Machine](./app-state) for the full state transition model.

---

## `sudoku:puzzle`

The full state of the current puzzle. Written on every user move.

```typescript
type PuzzleState = {
  puzzle: string; // 81 chars — original board, never changes
  edits: string; // 81 chars — user-placed values, '0' where nothing was placed
  difficulty: Difficulty; // 'easy' | 'medium' | 'hard' | 'extreme'
  seed: number; // u32 — identifies the puzzle for sharing / challenge mode
  status: "active" | "solved" | "abandoned";
  elapsedSeconds: number; // timer — persisted so it survives page reloads
};
```

### Notes

- `solution` is **not stored** — it is recomputed via `solve(puzzle)` on every app restart. This prevents trivial cheating via DevTools.
- `puzzle` and `edits` are kept separate so the frontend can always distinguish given cells (from `puzzle`) from user-placed cells (from `edits`).
- To reconstruct the full current board: for each index, use `edits[i]` if non-`'0'`, otherwise `puzzle[i]`.

```typescript
function currentBoard(puzzle: string, edits: string): string {
  return puzzle
    .split("")
    .map((cell, i) => (edits[i] !== "0" ? edits[i] : cell))
    .join("");
}
```

---

## Future: SQLite

LocalStorage is the current persistence layer. The plan is to migrate to a SQLite database (e.g. via the Origin Private File System) to support:

- A history of past completed puzzles
- Move-by-move replay
- Stats (average solve time per difficulty, hint usage, etc.)

The `PuzzleState` shape is designed to map cleanly to a single table row when that migration happens.
