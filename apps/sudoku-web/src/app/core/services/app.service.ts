import { Service, effect, inject, signal, untracked } from '@angular/core';
import type { AppPhase } from '../models/app-state.model';
import type { Difficulty } from '../models/difficulty.model';
import { GameService } from './game.service';
import { StorageService } from './storage.service';
import { SudokuService } from './sudoku.service';
import { VisibilityService } from './visibility.service';

@Service()
export class AppService {
  private readonly game = inject(GameService);
  private readonly sudoku = inject(SudokuService);
  private readonly storage = inject(StorageService);
  private readonly visibility = inject(VisibilityService);

  private readonly _phase = signal<AppPhase>('idle');
  private readonly _lastDifficulty = signal<Difficulty>('medium');
  private readonly _isRestoring = signal<boolean>(false);

  readonly phase = this._phase.asReadonly();
  readonly lastDifficulty = this._lastDifficulty.asReadonly();
  readonly isRestoring = this._isRestoring.asReadonly();

  constructor() {
    void this.boot();

    effect(() => {
      const visible = this.visibility.isVisible();
      const restoring = this._isRestoring();
      if (restoring) return;
      untracked(() => {
        const phase = this._phase();
        if (!visible && phase === 'playing') {
          this.pauseGame();
        } else if (visible && phase === 'paused') {
          this.continueGame();
        }
      });
    });
  }

  async startGame(difficulty: Difficulty): Promise<void> {
    this._phase.set('loading');
    this._lastDifficulty.set(difficulty);
    await this.game.beginNewPuzzle(difficulty);
    this._phase.set('playing');
    this.game.startTimer();
    this.persistAppState();
  }

  continueGame(): void {
    this._phase.set('playing');
    this.game.startTimer();
    this.persistAppState();
  }

  pauseGame(): void {
    this._phase.set('paused');
    this.game.pauseTimer();
    this.persistAppState();
  }

  async newGame(difficulty: Difficulty): Promise<void> {
    if (this.game.status() === 'solved') {
      this.game.pauseTimer();
    } else {
      this.game.markAbandoned();
    }
    this._phase.set('loading');
    this._lastDifficulty.set(difficulty);
    await this.game.beginNewPuzzle(difficulty);
    this._phase.set('playing');
    this.game.startTimer();
    this.persistAppState();
  }

  endGame(): void {
    this._phase.set('idle');
    this.game.pauseTimer();
    this.storage.clearPuzzle();
    this.persistAppState();
  }

  private async boot(): Promise<void> {
    const appState = this.storage.readAppState();
    if (!appState) return;

    this._lastDifficulty.set(appState.lastDifficulty);

    if (appState.phase === 'playing' || appState.phase === 'paused') {
      const puzzleState = this.storage.readPuzzle();
      if (!puzzleState) return;

      this._phase.set(appState.phase);
      this.game.loadPuzzle(puzzleState);
      this._isRestoring.set(true);

      const { value: solution } = await this.sudoku.solve(puzzleState.puzzle);
      if (solution) {
        this.game.setSolution(solution);
      }

      this._isRestoring.set(false);
    }
  }

  private persistAppState(): void {
    const phase = this._phase();
    if (phase === 'loading') return;
    this.storage.writeAppState({
      phase: phase as 'idle' | 'playing' | 'paused',
      lastDifficulty: this._lastDifficulty(),
    });
  }
}
