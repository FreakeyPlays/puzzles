import { Service, computed, inject, signal } from '@angular/core';
import type { PuzzleState, PuzzleStatus } from '../models/app-state.model';
import type { Difficulty } from '../models/difficulty.model';
import { StorageService } from './storage.service';
import { SudokuService } from './sudoku.service';

@Service()
export class GameService {
  private readonly sudoku = inject(SudokuService);
  private readonly storage = inject(StorageService);

  private readonly _puzzle = signal<string>('0'.repeat(81));
  private readonly _edits = signal<string>('0'.repeat(81));
  private readonly _difficulty = signal<Difficulty>('medium');
  private readonly _seed = signal<number>(0);
  private readonly _status = signal<PuzzleStatus>('in_progress');
  private readonly _elapsedSeconds = signal<number>(0);
  private solution = '';
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  readonly puzzle = this._puzzle.asReadonly();
  readonly edits = this._edits.asReadonly();
  readonly difficulty = this._difficulty.asReadonly();
  readonly status = this._status.asReadonly();
  readonly elapsedSeconds = this._elapsedSeconds.asReadonly();
  readonly currentBoard = computed(() => {
    const puzzle = this._puzzle();
    const edits = this._edits();
    return puzzle
      .split('')
      .map((cell, i) => (edits[i] !== '0' ? edits[i] : cell))
      .join('');
  });

  async beginNewPuzzle(difficulty: Difficulty): Promise<void> {
    const { value } = await this.sudoku.generate({ difficulty });
    this.solution = value.solution;
    this._puzzle.set(value.puzzle);
    this._edits.set('0'.repeat(81));
    this._difficulty.set(value.difficulty);
    this._seed.set(value.seed);
    this._status.set('in_progress');
    this._elapsedSeconds.set(0);
  }

  loadPuzzle(state: PuzzleState): void {
    this._puzzle.set(state.puzzle);
    this._edits.set(state.edits);
    this._difficulty.set(state.difficulty);
    this._seed.set(state.seed);
    this._status.set(state.status);
    this._elapsedSeconds.set(state.elapsedSeconds);
  }

  setSolution(solution: string): void {
    this.solution = solution;
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this._elapsedSeconds.update((s) => s + 1);
    }, 1000);
  }

  pauseTimer(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.storage.writePuzzle(this.snapshot());
  }

  markAbandoned(): void {
    this._status.set('abandoned');
    this.storage.writePuzzle(this.snapshot());
  }

  placeDigit(index: number, value: number): void {
    const edits = this._edits();
    const updated = edits.substring(0, index) + value.toString() + edits.substring(index + 1);
    this._edits.set(updated);
    this.checkWin();
    this.storage.writePuzzle(this.snapshot());
  }

  eraseDigit(index: number): void {
    const edits = this._edits();
    const updated = edits.substring(0, index) + '0' + edits.substring(index + 1);
    this._edits.set(updated);
    this.storage.writePuzzle(this.snapshot());
  }

  async requestHint(): Promise<void> {
    const { value } = await this.sudoku.hint(this.currentBoard());
    if (value !== null) {
      this.placeDigit(value.index, value.value);
    }
  }

  private checkWin(): void {
    const board = this.currentBoard();
    if (!board.includes('0') && board === this.solution) {
      this._status.set('solved');
      if (this.timerInterval !== null) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }
  }

  private snapshot(): PuzzleState {
    return {
      puzzle: this._puzzle(),
      edits: this._edits(),
      difficulty: this._difficulty(),
      seed: this._seed(),
      status: this._status(),
      elapsedSeconds: this._elapsedSeconds(),
    };
  }
}
