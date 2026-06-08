import { Service } from '@angular/core';
import type { AppState, GameState } from '../models/app-state.model';

@Service()
export class StorageService {
  private static readonly APP_KEY = 'sudoku:app';
  private static readonly PUZZLE_KEY = 'sudoku:puzzle';

  readAppState(): AppState | null {
    return this.read<AppState>(StorageService.APP_KEY);
  }

  writeAppState(state: AppState): void {
    this.write(StorageService.APP_KEY, state);
  }

  readPuzzle(): GameState | null {
    return this.read<GameState>(StorageService.PUZZLE_KEY);
  }

  writePuzzle(state: GameState): void {
    this.write(StorageService.PUZZLE_KEY, state);
  }

  clearPuzzle(): void {
    localStorage.removeItem(StorageService.PUZZLE_KEY);
  }

  private read<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private write<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or storage unavailable — silently ignore
    }
  }
}
