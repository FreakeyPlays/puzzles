import { Component, computed, inject, input, output } from '@angular/core';
import { HapticsService } from '../../../core/services/haptics.service';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-input-pad',
  imports: [],
  templateUrl: './input-pad.component.html',
})
export class InputPadComponent {
  readonly digitInput = output<number>();
  readonly solution = input<string>('');
  readonly currentBoard = input<string>('');

  private readonly haptic = inject(HapticsService);
  private readonly settings = inject(SettingsService);

  protected readonly digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  protected readonly usedDigits = computed<Set<number>>(() => {
    const solution = this.solution();
    const board = this.currentBoard();
    if (!this.settings.game().removeUsedNumbers || solution.length !== 81) return new Set();

    const used = new Set<number>();
    for (let d = 1; d <= 9; d++) {
      const s = d.toString();
      let needed = 0;
      let placed = 0;
      for (let i = 0; i < 81; i++) {
        if (solution[i] === s) {
          needed++;
          if (board[i] === s) placed++;
        }
      }
      if (placed >= needed) used.add(d);
    }
    return used;
  });

  onDigit(digit: number): void {
    this.digitInput.emit(digit);
    this.haptic.correct();
  }

  onErase(): void {
    this.digitInput.emit(0);
    this.haptic.erase();
  }
}
