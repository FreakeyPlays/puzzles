---
title: Services
description: Service responsibilities, public API and dependency graph for sudoku-web
---

## Dependency Graph

```
AppService  →  GameService
AppService  →  SudokuService
AppService  →  StorageService
AppService  →  VisibilityService
GameService →  SudokuService
GameService →  StorageService
```

No circular dependencies. `AppService` is the orchestrator — the only service that drives state transitions across other services. `SudokuService`, `StorageService`, and `VisibilityService` are leaf nodes with no service dependencies of their own.

---

## AppService

**Owns:** the App State Machine — controls which phase the app is in and coordinates transitions in `GameService`.

**Location:** `core/services/app.service.ts`

### Public signals

| Signal           | Type                                                   | Description                                                     |
| ---------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| `phase`          | `Signal<'idle' \| 'loading' \| 'playing' \| 'paused'>` | Current app phase                                               |
| `lastDifficulty` | `Signal<Difficulty>`                                   | Pre-selected in the difficulty modal; updated on every new game |
| `isRestoring`    | `Signal<boolean>`                                      | `true` while `solve()` recomputes the solution on app restart   |

### Public methods

| Method                  | Called by                                      | Description                                                           |
| ----------------------- | ---------------------------------------------- | --------------------------------------------------------------------- |
| `startGame(difficulty)` | `HomeComponent`                                | Transitions `idle → loading → playing`, generates a new puzzle        |
| `continueGame()`        | `HomeComponent`                                | Transitions `paused → playing`, resumes timer                         |
| `pauseGame()`           | `VisibilityService` effect, navigation events  | Transitions `playing → paused`, stops and persists timer              |
| `newGame(difficulty)`   | `HomeComponent`, `GameComponent`               | Marks current puzzle `abandoned`, transitions to `loading → playing`  |
| `endGame()`             | `GameComponent` (Result Overlay — Home button) | Transitions `playing → idle`, navigates to `/home` after call returns |

Components call these methods and then handle `router.navigate()` themselves — `AppService` does not touch the router.

### Boot sequence

On startup, `AppService` reads `sudoku:app` from `StorageService`. If `phase` is `'playing'` or `'paused'`, it:

1. Sets `isRestoring = true`
2. Reads `sudoku:puzzle` via `StorageService` and passes it to `GameService.loadPuzzle()`
3. Calls `SudokuService.solve(puzzle)` to recompute the solution in memory (async, ~5 ms)
4. Sets `isRestoring = false`

The Home screen shows the **Continue** button immediately (phase is restored from storage), but the button is disabled while `isRestoring` is `true` — preventing navigation to `/game` before the solution is ready.

---

## GameService

**Owns:** the active puzzle — board state, user edits, timer, and win detection.

**Location:** `core/services/game.service.ts`

### Public signals

| Signal           | Type                                               | Description                                                    |
| ---------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| `puzzle`         | `Signal<string>`                                   | Original 81-char board — given cells, never changes after load |
| `edits`          | `Signal<string>`                                   | User-placed values, `'0'` where nothing was placed             |
| `currentBoard`   | `Signal<string>`                                   | `computed` — merges `puzzle` and `edits`                       |
| `elapsedSeconds` | `Signal<number>`                                   | Timer count in seconds                                         |
| `difficulty`     | `Signal<Difficulty>`                               | Current puzzle difficulty                                      |
| `status`         | `Signal<'in_progress' \| 'solved' \| 'abandoned'>` | Puzzle lifecycle state                                         |

### Public methods

Called by `AppService`:

| Method                       | Description                                                    |
| ---------------------------- | -------------------------------------------------------------- |
| `beginNewPuzzle(difficulty)` | Calls `SudokuService.generate()`, sets up a fresh puzzle state |
| `loadPuzzle(state)`          | Restores puzzle from a `PuzzleState` record on app restart     |
| `startTimer()`               | Starts the 1-second interval                                   |
| `pauseTimer()`               | Clears the interval, writes `PuzzleState` to `StorageService`  |
| `markAbandoned()`            | Sets `status = 'abandoned'`, writes to `StorageService`        |

Called by components:

| Method                     | Description                                                        |
| -------------------------- | ------------------------------------------------------------------ |
| `placeDigit(index, value)` | Updates `edits`, checks win condition, writes to `StorageService`  |
| `eraseDigit(index)`        | Clears `edits[index]`, writes to `StorageService`                  |
| `requestHint()`            | Calls `SudokuService.hint()`, places the result via `placeDigit()` |

### Persistence

`PuzzleState` (including `elapsedSeconds`) is written to `StorageService` on every `placeDigit()` / `eraseDigit()` call and on every `pauseTimer()` call. The timer interval itself does not trigger writes.

### Win detection

After every `placeDigit()`, `GameService` checks:

```typescript
if (!currentBoard.includes("0") && currentBoard === this.solution) {
  this.status.set("solved");
}
```

`solution` is kept in memory only — never persisted to LocalStorage. `GameComponent` reacts to `status()` becoming `'solved'` and shows the Result Overlay. `AppService` is not involved until the user presses a button on the overlay.

---

## StorageService

**Owns:** all LocalStorage reads and writes — typed, centralised, handles quota and parse errors silently.

**Location:** `core/services/storage.service.ts`

```typescript
readAppState(): AppState | null
writeAppState(state: AppState): void

readPuzzle(): PuzzleState | null
writePuzzle(state: PuzzleState): void
clearPuzzle(): void
```

Storage key names (`sudoku:app`, `sudoku:puzzle`) are internal to this service — nothing outside references them as strings. See [Local Storage](./local-storage) for the full schema.

---

## VisibilityService

**Owns:** the Page Visibility API — wraps the browser `visibilitychange` event as a Signal.

**Location:** `core/services/visibility.service.ts`

```typescript
readonly isVisible: Signal<boolean>
```

`AppService` reacts to this signal via an `effect()` — calling `pauseGame()` when `isVisible` becomes `false`, and `continueGame()` when it returns to `true` while `phase === 'playing'`. Components never inject `VisibilityService` directly.

---

## SudokuService

**Owns:** the WASM worker bridge — all calls to the Rust solver and generator go through here.

**Location:** `core/services/sudoku.service.ts`

See [Worker Protocol](./worker-protocol) for the full API surface.
