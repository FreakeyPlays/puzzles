import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../core/services/app.service';
import { GameService } from '../../core/services/game.service';
import { BoardComponent } from './board/board.component';
import { InputPadComponent } from './input-pad/input-pad.component';

@Component({
  selector: 'app-game',
  imports: [BoardComponent, InputPadComponent],
  templateUrl: './game.component.html',
})
export class GameComponent {
  protected readonly app = inject(AppService);
  protected readonly game = inject(GameService);
  private readonly router = inject(Router);

  protected readonly selectedIndex = signal<number | null>(null);

  protected readonly isSolved = computed(() => this.game.status() === 'solved');

  protected readonly formattedTime = computed(() => {
    const s = this.game.elapsedSeconds();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  });

  protected readonly difficultyLabel = computed(() => {
    const d = this.game.difficulty();
    return d.charAt(0).toUpperCase() + d.slice(1);
  });

  onCellSelect(index: number): void {
    this.selectedIndex.update((prev) => (prev === index ? null : index));
  }

  onDigitInput(digit: number): void {
    const index = this.selectedIndex();
    if (index === null) return;
    if (this.game.puzzle()[index] !== '0') return;

    if (digit === 0) {
      this.game.eraseDigit(index);
    } else {
      this.game.placeDigit(index, digit);
    }
  }

  async requestHint(): Promise<void> {
    await this.game.requestHint();
  }

  async startNewGameFromResult(): Promise<void> {
    await this.app.newGame(this.game.difficulty());
    this.selectedIndex.set(null);
  }

  goHome(): void {
    this.app.endGame();
    void this.router.navigate(['/']);
  }
}
