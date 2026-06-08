import { Service } from '@angular/core';
import type { AppState, GameState } from '../models/app-state.model';

@Service()
export class StorageService {
  private static readonly APP_KEY = 'sudoku:app';
  private static readonly PUZZLE_KEY = 'sudoku:puzzle';

  readAppState(): AppState | null {
    try {
      const raw = localStorage.getItem(StorageService.APP_KEY);
      return raw ? (JSON.parse(raw) as AppState) : null;
    } catch {
      return null;
    }
  }

  writeAppState(state: AppState): void {
    try {
      localStorage.setItem(StorageService.APP_KEY, JSON.stringify(state));
    } catch {
      // Quota exceeded or unavailable — silently ignore
    }
  }

  readPuzzle(): GameState | null {
    try {
      const raw = localStorage.getItem(StorageService.PUZZLE_KEY);
      return raw ? (JSON.parse(raw) as GameState) : null;
    } catch {
      return null;
    }
  }

  writePuzzle(state: GameState): void {
    try {
      localStorage.setItem(StorageService.PUZZLE_KEY, JSON.stringify(state));
    } catch {
      // Quota exceeded or unavailable — silently ignore
    }
  }

  clearPuzzle(): void {
    localStorage.removeItem(StorageService.PUZZLE_KEY);
  }
}
