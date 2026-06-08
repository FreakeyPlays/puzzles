import { TestBed } from '@angular/core/testing';
import type { AppState, GameState } from '../models/app-state.model';
import { StorageService } from './storage.service';

const PUZZLE_STATE: GameState = {
  puzzle: '0'.repeat(81),
  edits: '0'.repeat(81),
  difficulty: 'medium',
  seed: 42,
  status: 'in_progress',
  elapsedSeconds: 120,
};

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  afterEach(() => localStorage.clear());

  describe('readAppState / writeAppState', () => {
    it('returns null when nothing is stored', () => {
      expect(service.readAppState()).toBeNull();
    });

    it('round-trips an app state object', () => {
      const state: AppState = { phase: 'idle', lastDifficulty: 'hard' };
      service.writeAppState(state);
      expect(service.readAppState()).toEqual(state);
    });

    it('returns null when the stored value is invalid JSON', () => {
      localStorage.setItem('sudoku:app', '{bad json}');
      expect(service.readAppState()).toBeNull();
    });
  });

  describe('readPuzzle / writePuzzle', () => {
    it('returns null when nothing is stored', () => {
      expect(service.readPuzzle()).toBeNull();
    });

    it('round-trips a puzzle state object', () => {
      service.writePuzzle(PUZZLE_STATE);
      expect(service.readPuzzle()).toEqual(PUZZLE_STATE);
    });

    it('overwrites an existing puzzle state', () => {
      service.writePuzzle(PUZZLE_STATE);
      const updated: GameState = { ...PUZZLE_STATE, elapsedSeconds: 300, status: 'solved' };
      service.writePuzzle(updated);
      expect(service.readPuzzle()).toEqual(updated);
    });
  });

  describe('clearPuzzle', () => {
    it('removes the puzzle from localStorage', () => {
      service.writePuzzle(PUZZLE_STATE);
      service.clearPuzzle();
      expect(service.readPuzzle()).toBeNull();
    });

    it('is a no-op when nothing is stored', () => {
      expect(() => service.clearPuzzle()).not.toThrow();
    });
  });
});
