import { Component, ElementRef, input, linkedSignal, output, viewChild } from '@angular/core';
import type { Difficulty } from '@repo/sudoku-wasm';
import { AutoShowDialogDirective } from '../directives/auto-show-dialog.directive';

@Component({
  selector: 'app-modal',
  imports: [AutoShowDialogDirective],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly initialDifficulty = input<Difficulty>('medium');
  readonly cancelModal = output<void>();
  readonly confirmModal = output<Difficulty>();

  protected readonly difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'extreme'];
  protected readonly selected = linkedSignal(() => this.initialDifficulty());

  onSelect(difficulty: Difficulty): void {
    this.selected.set(difficulty);
  }

  onCancel(): void {
    this.dialogRef().nativeElement.close();
    this.cancelModal.emit();
  }

  onConfirm(): void {
    this.dialogRef().nativeElement.close();
    this.confirmModal.emit(this.selected());
  }

  onDialogCancel(event: Event): void {
    event.preventDefault();
    this.onCancel();
  }
}
