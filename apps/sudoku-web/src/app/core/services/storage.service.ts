import { Service } from '@angular/core';
import type { AppState, GameState } from '../models/app-state.model';
import { AppSettings } from './settings.service';

@Service()
export class StorageService {
  private static readonly APP_KEY = 'sudoku:app';
  private static readonly PUZZLE_KEY = 'sudoku:puzzle';
  private static readonly SETTINGS_KEY = 'sudoku:settings';
  private static readonly THEME_KEY = 'sudoku:theme';

  readAppState(): AppState | null {
    return this.read<AppState>(StorageService.APP_KEY);
  }

  writeAppState(state: AppState): void {
    this.write(StorageService.APP_KEY, state);
  }

  readSettings(): AppSettings | null {
    return this.read<AppSettings>(StorageService.SETTINGS_KEY);
  }

  writeSettings(state: AppSettings): void {
    this.write(StorageService.SETTINGS_KEY, state);
    this.write(StorageService.THEME_KEY, state.ui.theme);
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
