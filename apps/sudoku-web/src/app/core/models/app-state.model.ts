import type { Difficulty } from './difficulty.model';

export type AppPhase = 'idle' | 'initializing' | 'loading' | 'playing' | 'paused';
export type PuzzleStatus = 'in_progress' | 'solved' | 'abandoned';

export type AppState = {
  phase: AppPhase;
  lastDifficulty: Difficulty;
};

export type GameState = {
  puzzle: string;
  edits: string;
  difficulty: Difficulty;
  seed: number;
  status: PuzzleStatus;
  elapsedSeconds: number;
};
