---
title: Worker Protocol
description: TypeScript types for the WASM Web Worker interface
---

`worker-protocol.ts` is the single source of truth for the contract between `SudokuService` and the Web Worker. Adding a new WASM function requires only updating `WorkerFunctions` here — the Worker and Service infrastructure pick it up automatically.

## Shared Types

```typescript
export type Difficulty = "easy" | "medium" | "hard" | "extreme";

export type GenerateResult = {
  puzzle: string; // 81 chars, '0' = empty
  solution: string; // 81 chars, fully solved
  difficulty: Difficulty;
  seed: number; // u32 — always present, even if not passed as input
};

export type ValidateResult = {
  valid: boolean;
  solved: boolean;
  conflicts: number[]; // cell indices (0–80); empty when valid
};

export type HintResult = {
  index: number; // cell index (0–80)
  value: number; // 1–9
  technique: string; // e.g. "naked_single", "hidden_single"
};
```

## WorkerFunctions

Each entry maps a function name to its `args` and `result` types. The worker infrastructure handles serialization, IDs, and error forwarding automatically.

```typescript
export type WorkerFunctions = {
  generate: {
    args: { difficulty?: Difficulty; seed?: number };
    result: GenerateResult;
  };
  solve: {
    args: string; // 81-char board string
    result: string | null;
  };
  validate: {
    args: string; // 81-char board string
    result: ValidateResult;
  };
  hint: {
    args: string; // 81-char board string
    result: HintResult | null;
  };
};
```

## SudokuService API

The Angular service exposes one typed method per WASM function. Each returns a `Promise<CallResult<K>>` where `CallResult` carries both the value and the WASM execution time.

```typescript
// Generate a new puzzle
sudoku.generate({ difficulty?: Difficulty, seed?: number })
  : Promise<CallResult<'generate'>>

// Compute the solution (returns null if board is unsolvable)
sudoku.solve(board: string)
  : Promise<CallResult<'solve'>>

// Rule-based validation — returns conflicts + solved status
sudoku.validate(board: string)
  : Promise<CallResult<'validate'>>

// Easiest available move, null if already solved
sudoku.hint(board: string)
  : Promise<CallResult<'hint'>>
```

## Board Format

All board arguments are **81-character strings**:

```typescript
// Accessing a specific cell:
const value = board[row * 9 + col]; // '0'–'9'

// Counting given cells:
const givens = board.split("").filter((c) => c !== "0").length;

// Applying a user edit:
const updated = board.substring(0, index) + value + board.substring(index + 1);
```

## Adding a New WASM Function

1. Add the Rust function to `sudoku-wasm/src/lib.rs` with `#[wasm_bindgen]`
2. Add the entry to `WorkerFunctions` in `worker-protocol.ts`
3. Add the handler to the `handlers` map in `sudoku.worker.ts`
4. Add the typed method to `SudokuService`
