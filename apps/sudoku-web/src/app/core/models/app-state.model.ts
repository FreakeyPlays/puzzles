import type { Difficulty } from '@repo/sudoku-wasm';

export type ActiveAppStatus = 'playing' | 'paused';
export type AppStatus = 'idle' | 'initializing' | 'loading' | ActiveAppStatus;
export function isActiveAppStatus(phase: AppStatus): phase is ActiveAppStatus {
  return phase === 'playing' || phase === 'paused';
}
export type GameStatus = 'active' | 'solved' | 'abandoned';

export type AppState = {
  phase: AppStatus;
  lastDifficulty: Difficulty;
};

export type GameState = {
  puzzle: string;
  edits: string;
  difficulty: Difficulty;
  seed: number;
  status: GameStatus;
  elapsedSeconds: number;
};
