import type { Difficulty } from './difficulty.model';

export type AppPhase = 'idle' | 'loading' | 'playing' | 'paused';
export type PuzzleStatus = 'in_progress' | 'solved' | 'abandoned';

export type AppState = {
  phase: 'idle' | 'playing' | 'paused';
  lastDifficulty: Difficulty;
};

export type PuzzleState = {
  puzzle: string;
  edits: string;
  difficulty: Difficulty;
  seed: number;
  status: PuzzleStatus;
  elapsedSeconds: number;
};
