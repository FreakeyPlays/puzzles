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
      const scale = Math.max(0, Math.min(1, (window.innerWidth - 390) / (1440 - 390)));
      const velocityBoost = scale * 20;
      const countScale = 1 + scale * 0.5;

      this.fireCannon({ x: 0, y: 0.8 }, 90, velocityBoost, countScale);
      this.fireCannon({ x: 1, y: 0.8 }, 90, velocityBoost, countScale);
    });
  }

  private fireCannon(
    origin: ConfettoOrigin,
    angle: number,
    velocityBoost: number,
    countScale: number,
  ): void {
    const base: ConfettiOptions = { origin, angle, spread: 35, startVelocity: 50 + velocityBoost };
    setTimeout(
      () =>
        confetti({
          ...base,
          particleCount: Math.round(40 * countScale),
          spread: 25,
          startVelocity: 40 + velocityBoost,
        }),
      200,
    );
    setTimeout(
      () =>
        confetti({
          ...base,
          particleCount: Math.round(50 * countScale),
          spread: 45,
          startVelocity: 55 + velocityBoost,
        }),
      400,
    );
  }
}
