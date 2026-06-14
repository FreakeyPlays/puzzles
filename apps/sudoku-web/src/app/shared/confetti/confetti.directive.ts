import { afterNextRender, Directive } from '@angular/core';
import confetti, {
  type Options as ConfettiOptions,
  Origin as ConfettoOrigin,
} from 'canvas-confetti';

@Directive({
  selector: '[appConfetti]',
})
export class ConfettiDirective {
  constructor() {
    afterNextRender(() => {
      this.fireCannon({ x: 0, y: 0.8 }, 90);
      this.fireCannon({ x: 1, y: 0.8 }, 90);
    });
  }

  private fireCannon(origin: ConfettoOrigin, angle: number): void {
    const base: ConfettiOptions = { origin, angle, spread: 35, startVelocity: 50 };
    void confetti({ ...base, particleCount: 60 });
    setTimeout(() => confetti({ ...base, particleCount: 40, spread: 25, startVelocity: 40 }), 200);
    setTimeout(() => confetti({ ...base, particleCount: 50, spread: 45, startVelocity: 55 }), 400);
  }
}
