import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { Difficulty } from '@repo/sudoku-wasm';
import { AppService } from '../../core/services/app.service';
import { ModalComponent } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-home',
  imports: [ModalComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  protected readonly app = inject(AppService);
  private readonly router = inject(Router);

  protected readonly showModal = signal(false);
  protected readonly hasActiveGame = computed(() => {
    const phase = this.app.phase();
    return phase === 'playing' || phase === 'paused';
  });

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  async onStartGame(difficulty: Difficulty): Promise<void> {
    this.showModal.set(false);
    await this.app.startGame(difficulty);
    void this.router.navigate(['/game']);
  }

  continueGame(): void {
    this.app.continueGame();
    void this.router.navigate(['/game']);
  }

  async onNewGame(difficulty: Difficulty): Promise<void> {
    this.showModal.set(false);
    await this.app.newGame(difficulty);
    void this.router.navigate(['/game']);
  }
}
