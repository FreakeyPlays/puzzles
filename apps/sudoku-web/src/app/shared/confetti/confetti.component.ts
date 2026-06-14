import { afterNextRender, Component } from '@angular/core';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-confetti',
  template: '',
})
export class ConfettiComponent {
  constructor() {
    afterNextRender(() => {
      this.fireCannon({ x: 0, y: 1 }, 60);
      this.fireCannon({ x: 1, y: 1 }, 120);
    });
  }

  private fireCannon(origin: confetti.Origin, angle: number): void {
    const base: confetti.Options = { origin, angle, spread: 35, startVelocity: 50 };
    void confetti({ ...base, particleCount: 60 });
    setTimeout(() => confetti({ ...base, particleCount: 40, spread: 25, startVelocity: 40 }), 200);
    setTimeout(() => confetti({ ...base, particleCount: 50, spread: 45, startVelocity: 55 }), 400);
  }
}
