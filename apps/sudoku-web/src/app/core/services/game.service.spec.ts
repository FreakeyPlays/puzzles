import { TestBed } from '@angular/core/testing';
import type { GameState } from '../models/app-state.model';
import { GameService } from './game.service';
import { StorageService } from './storage.service';
import { SudokuService } from './sudoku.service';

const EMPTY_BOARD = '0'.repeat(81);

const BASE_STATE: GameState = {
  puzzle: EMPTY_BOARD,
  edits: EMPTY_BOARD,
  difficulty: 'medium',
  seed: 1,
  status: 'in_progress',
  elapsedSeconds: 0,
};

describe('GameService', () => {
  let service: GameService;
  let mockStorage: { writePuzzle: ReturnType<typeof vi.fn>; readPuzzle: ReturnType<typeof vi.fn> };
  let mockSudoku: { generate: ReturnType<typeof vi.fn>; hint: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockStorage = { writePuzzle: vi.fn(), readPuzzle: vi.fn().mockReturnValue(null) };
    mockSudoku = { generate: vi.fn(), hint: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useValue: mockStorage },
        { provide: SudokuService, useValue: mockSudoku },
      ],
    });
    service = TestBed.inject(GameService);
  });

  afterEach(() => vi.useRealTimers());

  describe('loadPuzzle', () => {
    it('loads all fields from the saved state', () => {
      const state: GameState = {
        puzzle: '1'.repeat(81),
        edits: '2'.repeat(81),
        difficulty: 'hard',
        seed: 99,
        status: 'in_progress',
        elapsedSeconds: 300,
      };
      service.loadPuzzle(state);
      expect(service.puzzle()).toBe(state.puzzle);
      expect(service.edits()).toBe(state.edits);
      expect(service.difficulty()).toBe('hard');
      expect(service.elapsedSeconds()).toBe(300);
    });
  });

  describe('currentBoard', () => {
    it('uses the puzzle value where edits are zero', () => {
      service.loadPuzzle({ ...BASE_STATE, puzzle: '5' + '0'.repeat(80) });
      expect(service.currentBoard()[0]).toBe('5');
    });

    it('uses the edit value when present', () => {
      service.loadPuzzle({ ...BASE_STATE, puzzle: EMPTY_BOARD, edits: '7' + '0'.repeat(80) });
      expect(service.currentBoard()[0]).toBe('7');
    });

    it('edit value takes precedence over puzzle value', () => {
      service.loadPuzzle({
        ...BASE_STATE,
        puzzle: '5' + '0'.repeat(80),
        edits: '7' + '0'.repeat(80),
      });
      expect(service.currentBoard()[0]).toBe('7');
    });
  });

  describe('placeDigit', () => {
    it('sets the digit in edits at the given index', () => {
      service.loadPuzzle(BASE_STATE);
      service.placeDigit(5, 3);
      expect(service.edits()[5]).toBe('3');
    });

    it('does not affect other positions', () => {
      service.loadPuzzle(BASE_STATE);
      service.placeDigit(5, 3);
      expect(service.edits()[4]).toBe('0');
      expect(service.edits()[6]).toBe('0');
    });

    it('persists the game after placing', () => {
      service.loadPuzzle(BASE_STATE);
      service.placeDigit(0, 1);
      expect(mockStorage.writePuzzle).toHaveBeenCalled();
    });
  });

  describe('eraseDigit', () => {
    it('resets the edit at the given index to zero', () => {
      service.loadPuzzle({ ...BASE_STATE, edits: '9' + '0'.repeat(80) });
      service.eraseDigit(0);
      expect(service.edits()[0]).toBe('0');
    });

    it('persists the game after erasing', () => {
      service.loadPuzzle(BASE_STATE);
      service.eraseDigit(0);
      expect(mockStorage.writePuzzle).toHaveBeenCalled();
    });
  });

  describe('win detection', () => {
    it('sets status to solved when board matches solution and has no zeros', () => {
      // puzzle: cell 0 empty, rest are '1' (given)
      const puzzle = '0' + '1'.repeat(80);
      // solution: all '1'
      const solution = '1'.repeat(81);
      service.loadPuzzle({ ...BASE_STATE, puzzle });
      service.setSolution(solution);
      service.placeDigit(0, 1);
      expect(service.status()).toBe('solved');
    });

    it('does not mark solved when board still has zeros', () => {
      service.loadPuzzle(BASE_STATE);
      service.setSolution('1'.repeat(81));
      service.placeDigit(0, 1);
      expect(service.status()).toBe('in_progress');
    });

    it('does not mark solved when board is complete but wrong', () => {
      const puzzle = '0' + '2'.repeat(80);
      service.loadPuzzle({ ...BASE_STATE, puzzle });
      service.setSolution('1'.repeat(81));
      service.placeDigit(0, 9); // wrong digit
      expect(service.status()).toBe('in_progress');
    });
  });

  describe('markAbandoned', () => {
    it('sets status to abandoned and persists', () => {
      service.loadPuzzle(BASE_STATE);
      service.markAbandoned();
      expect(service.status()).toBe('abandoned');
      expect(mockStorage.writePuzzle).toHaveBeenCalled();
    });
  });

  describe('timer', () => {
    it('increments elapsedSeconds each second', () => {
      vi.useFakeTimers();
      service.loadPuzzle(BASE_STATE);
      service.startTimer();
      vi.advanceTimersByTime(3000);
      expect(service.elapsedSeconds()).toBe(3);
    });

    it('stopTimer halts the increment', () => {
      vi.useFakeTimers();
      service.loadPuzzle(BASE_STATE);
      service.startTimer();
      vi.advanceTimersByTime(2000);
      service.stopTimer();
      vi.advanceTimersByTime(2000);
      expect(service.elapsedSeconds()).toBe(2);
    });

    it('stopTimer is safe when no timer is running', () => {
      expect(() => service.stopTimer()).not.toThrow();
    });
  });

  describe('requestHint', () => {
    it('places the hint digit at the returned index', async () => {
      service.loadPuzzle(BASE_STATE);
      service.setSolution('1'.repeat(81));
      mockSudoku.hint.mockResolvedValue({ value: { index: 10, value: 7 }, durationMs: 5 });
      await service.requestHint();
      expect(service.edits()[10]).toBe('7');
    });

    it('does nothing when the worker returns undefined (no hint available)', async () => {
      service.loadPuzzle(BASE_STATE);
      mockSudoku.hint.mockResolvedValue({ value: undefined, durationMs: 5 });
      const editsBefore = service.edits();
      await service.requestHint();
      expect(service.edits()).toBe(editsBefore);
    });
  });
});
