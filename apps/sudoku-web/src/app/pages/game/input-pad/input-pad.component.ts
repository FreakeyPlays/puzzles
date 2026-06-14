import { Component, inject, output } from '@angular/core';
import { HapticsService } from '../../../core/services/haptics.service';

@Component({
  selector: 'app-input-pad',
  imports: [],
  templateUrl: './input-pad.component.html',
})
export class InputPadComponent {
  readonly digitInput = output<number>();
  private readonly haptic = inject(HapticsService);

  protected readonly digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  onDigit(digit: number): void {
    this.digitInput.emit(digit);
    this.haptic.correct();
  }

  onErase(): void {
    this.digitInput.emit(0);
    this.haptic.erase();
  }
}
