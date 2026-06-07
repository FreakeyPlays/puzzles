import { Component, input, linkedSignal, output } from '@angular/core';
import type { Difficulty } from '../../core/models/difficulty.model';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  readonly initialDifficulty = input<Difficulty>('medium');
  readonly cancelModal = output<void>();
  readonly confirmModal = output<Difficulty>();

  protected readonly difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'extreme'];
  protected readonly selected = linkedSignal(() => this.initialDifficulty());

  onSelect(difficulty: Difficulty): void {
    this.selected.set(difficulty);
  }

  onCancel(): void {
    this.cancelModal.emit();
  }

  onConfirm(): void {
    this.confirmModal.emit(this.selected());
  }
}
