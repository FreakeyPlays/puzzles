import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import type { GameState } from '../models/app-state.model';
import { AppService } from './app.service';
import { GameService } from './game.service';
import { StorageService } from './storage.service';
import { SudokuService } from './sudoku.service';
import { VisibilityService } from './visibility.service';

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const PUZZLE_STATE: GameState = {
  puzzle: '0'.repeat(81),
  edits: '0'.repeat(81),
  difficulty: 'medium',
  seed: 1,
  status: 'in_progress',
  elapsedSeconds: 60,
};

describe('AppService', () => {
  let mockGame: {
    startTimer: ReturnType<typeof vi.fn>;
    stopTimer: ReturnType<typeof vi.fn>;
    persistGame: ReturnType<typeof vi.fn>;
    markAbandoned: ReturnType<typeof vi.fn>;
    beginNewPuzzle: ReturnType<typeof vi.fn>;
    loadPuzzle: ReturnType<typeof vi.fn>;
    setSolution: ReturnType<typeof vi.fn>;
    status: ReturnType<typeof signal<'in_progress' | 'solved' | 'abandoned'>>;
  };
  let mockSudoku: { solve: ReturnType<typeof vi.fn> };
  let mockStorage: {
    readAppState: ReturnType<typeof vi.fn>;
    writeAppState: ReturnType<typeof vi.fn>;
    readPuzzle: ReturnType<typeof vi.fn>;
    writePuzzle: ReturnType<typeof vi.fn>;
    clearPuzzle: ReturnType<typeof vi.fn>;
  };
  let mockVisibility: {
    isVisible: ReturnType<typeof signal<boolean>>;
    isHidden: ReturnType<typeof signal<boolean>>;
  };

  function setupService() {
    TestBed.configureTestingModule({
      providers: [
        { provide: GameService, useValue: mockGame },
        { provide: SudokuService, useValue: mockSudoku },
        { provide: StorageService, useValue: mockStorage },
        { provide: VisibilityService, useValue: mockVisibility },
      ],
    });
    return TestBed.inject(AppService);
  }

  beforeEach(() => {
    mockGame = {
      startTimer: vi.fn(),
      stopTimer: vi.fn(),
      persistGame: vi.fn(),
      markAbandoned: vi.fn(),
      beginNewPuzzle: vi.fn().mockResolvedValue(undefined),
      loadPuzzle: vi.fn(),
      setSolution: vi.fn(),
      status: signal('in_progress'),
    };
    mockSudoku = {
      solve: vi.fn().mockResolvedValue({ value: null, durationMs: 0 }),
    };
    mockStorage = {
      readAppState: vi.fn().mockReturnValue(null),
      writeAppState: vi.fn(),
      readPuzzle: vi.fn().mockReturnValue(null),
      writePuzzle: vi.fn(),
      clearPuzzle: vi.fn(),
    };
    mockVisibility = {
      isVisible: signal(true),
      isHidden: signal(false),
    };
  });

  describe('boot', () => {
    it('sets phase to idle when no stored app state', async () => {
      const service = setupService();
      await flushMicrotasks();
      expect(service.phase()).toBe('idle');
    });

    it('sets phase to idle when stored state is not active', async () => {
      mockStorage.readAppState.mockReturnValue({ phase: 'idle', lastDifficulty: 'easy' });
      const service = setupService();
      await flushMicrotasks();
      expect(service.phase()).toBe('idle');
    });

    it('restores a playing game and resolves the solution', async () => {
      mockStorage.readAppState.mockReturnValue({ phase: 'playing', lastDifficulty: 'medium' });
      mockStorage.readPuzzle.mockReturnValue(PUZZLE_STATE);
      mockSudoku.solve.mockResolvedValue({ value: '1'.repeat(81), durationMs: 10 });

      const service = setupService();
      await flushMicrotasks();

      expect(mockGame.loadPuzzle).toHaveBeenCalledWith(PUZZLE_STATE);
      expect(mockGame.setSolution).toHaveBeenCalledWith('1'.repeat(81));
      expect(service.phase()).toBe('playing');
    });

    it('falls back to idle when stored active game has no puzzle', async () => {
      mockStorage.readAppState.mockReturnValue({ phase: 'playing', lastDifficulty: 'medium' });
      mockStorage.readPuzzle.mockReturnValue(null);

      const service = setupService();
      await flushMicrotasks();

      expect(service.phase()).toBe('idle');
    });

    it('falls back to idle when the solver returns no solution', async () => {
      mockStorage.readAppState.mockReturnValue({ phase: 'playing', lastDifficulty: 'medium' });
      mockStorage.readPuzzle.mockReturnValue(PUZZLE_STATE);
      mockSudoku.solve.mockResolvedValue({ value: null, durationMs: 0 });

      const service = setupService();
      await flushMicrotasks();

      expect(service.phase()).toBe('idle');
      expect(mockStorage.clearPuzzle).toHaveBeenCalled();
    });
  });

  describe('startGame', () => {
    it('transitions idle → loading → playing', async () => {
      const service = setupService();
      await flushMicrotasks();

      await service.startGame('hard');
      expect(service.phase()).toBe('playing');
      expect(service.lastDifficulty()).toBe('hard');
    });
  });

  describe('pauseGame / continueGame', () => {
    it('sets phase to paused', async () => {
      const service = setupService();
      await flushMicrotasks();
      await service.startGame('medium');
      service.pauseGame();
      expect(service.phase()).toBe('paused');
    });

    it('sets phase back to playing', async () => {
      const service = setupService();
      await flushMicrotasks();
      await service.startGame('medium');
      service.pauseGame();
      service.continueGame();
      expect(service.phase()).toBe('playing');
    });
  });

  describe('endGame', () => {
    it('sets phase to idle and clears the stored puzzle', async () => {
      const service = setupService();
      await flushMicrotasks();
      await service.startGame('medium');
      service.endGame();
      expect(service.phase()).toBe('idle');
      expect(mockStorage.clearPuzzle).toHaveBeenCalled();
    });
  });

  describe('newGame', () => {
    it('marks the current game abandoned when not solved', async () => {
      mockGame.status.set('in_progress');
      const service = setupService();
      await flushMicrotasks();
      await service.startGame('medium');
      await service.newGame('easy');
      expect(mockGame.markAbandoned).toHaveBeenCalled();
    });

    it('does not mark abandoned when the current game is already solved', async () => {
      mockGame.status.set('solved');
      const service = setupService();
      await flushMicrotasks();
      await service.startGame('medium');
      await service.newGame('easy');
      expect(mockGame.markAbandoned).not.toHaveBeenCalled();
    });
  });
});
