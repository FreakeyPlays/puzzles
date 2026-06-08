import { Component, output } from '@angular/core';

@Component({
  selector: 'app-input-pad',
  imports: [],
  templateUrl: './input-pad.component.html',
})
export class InputPadComponent {
  readonly digitInput = output<number>();

  protected readonly digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  onDigit(digit: number): void {
    this.digitInput.emit(digit);
  }

  onErase(): void {
    this.digitInput.emit(0);
  }
}
