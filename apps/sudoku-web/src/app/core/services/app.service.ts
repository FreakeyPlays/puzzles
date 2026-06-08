import { Service, effect, inject, signal, untracked } from '@angular/core';
import type { AppStatus } from '../models/app-state.model';
import { DEFAULT_DIFFICULTY } from '../models/difficulty.model';
import type { Difficulty } from '@repo/sudoku-wasm';
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

  private readonly _phase = signal<AppStatus>('initializing');
  private readonly _lastDifficulty = signal<Difficulty>(DEFAULT_DIFFICULTY);
  private readonly _isRestoring = signal<boolean>(false);

  readonly phase = this._phase.asReadonly();
  readonly lastDifficulty = this._lastDifficulty.asReadonly();
  readonly isRestoring = this._isRestoring.asReadonly();

  constructor() {
    void this.boot();

    // Start/stop the timer reactively based on the current phase.
    effect(() => {
      const phase = this._phase();
      const isNotRestoring = !this._isRestoring();
      untracked(() => {
        if (phase === 'playing' && isNotRestoring) {
          this.game.startTimer();
        } else {
          this.game.stopTimer();
          if (phase !== 'loading' && phase !== 'initializing' && isNotRestoring) {
            this.game.persistGame();
          }
        }
      });
    });

    // Persist app state reactively whenever the phase or difficulty changes.
    effect(() => {
      const phase = this._phase();
      const lastDifficulty = this._lastDifficulty();
      if (phase === 'loading' || phase === 'initializing') return;
      untracked(() => {
        this.storage.writeAppState({ phase, lastDifficulty });
      });
    });

    // Pause/resume when the page visibility changes.
    effect(() => {
      const isVisible = this.visibility.isVisible();
      const isHidden = !isVisible;
      const restoring = this._isRestoring(); // TODO: Check if we can move into the untacked function
      if (restoring) return;
      untracked(() => {
        const phase = this._phase();
        if (isHidden && phase === 'playing') {
          this.pauseGame();
        } else if (isVisible && phase === 'paused') {
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
  }

  continueGame(): void {
    this._phase.set('playing');
  }

  pauseGame(): void {
    this._phase.set('paused');
  }

  async newGame(difficulty: Difficulty): Promise<void> {
    if (this.game.status() !== 'solved') {
      this.game.markAbandoned();
    }
    this._phase.set('loading');
    this._lastDifficulty.set(difficulty);
    await this.game.beginNewPuzzle(difficulty);
    this._phase.set('playing');
  }

  endGame(): void {
    this._phase.set('idle');
    this.storage.clearPuzzle();
  }

  private async boot(): Promise<void> {
    const appState = this.storage.readAppState();
    if (!appState) {
      this._phase.set('idle');
      return;
    }

    this._lastDifficulty.set(appState.lastDifficulty);

    if (appState.phase === 'playing' || appState.phase === 'paused') {
      const puzzleState = this.storage.readPuzzle();
      if (!puzzleState) {
        this._phase.set('idle');
        return;
      }

      this._phase.set(appState.phase);
      this.game.loadPuzzle(puzzleState);
      this._isRestoring.set(true);

      const { value: solution } = await this.sudoku.solve(puzzleState.puzzle);
      if (!solution) {
        this._isRestoring.set(false);
        this._phase.set('idle');
        this.storage.clearPuzzle();
        return;
      }

      this.game.setSolution(solution);
      this._isRestoring.set(false);
    } else {
      this._phase.set('idle');
    }
  }
}
