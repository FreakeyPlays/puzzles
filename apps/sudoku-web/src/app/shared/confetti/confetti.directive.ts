import { afterNextRender, Directive, ElementRef, inject } from '@angular/core';
import confetti from 'canvas-confetti';

@Directive({
  selector: '[appConfetti]',
})
export class ConfettiDirective {
  private readonly el = inject(ElementRef);

  constructor() {
    afterNextRender(() => {
      const rect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
      const centerX = (rect.left + rect.right) / 2 / window.innerWidth;

      this.fireCannon({ x: centerX - 0.1, y: 0.8 }, 90);
      this.fireCannon({ x: centerX + 0.1, y: 0.8 }, 90);
    });
  }

  private fireCannon(origin: confetti.Origin, angle: number): void {
    const base: confetti.Options = { origin, angle, spread: 35, startVelocity: 50 };
    void confetti({ ...base, particleCount: 60 });
    setTimeout(() => confetti({ ...base, particleCount: 40, spread: 25, startVelocity: 40 }), 200);
    setTimeout(() => confetti({ ...base, particleCount: 50, spread: 45, startVelocity: 55 }), 400);
  }
}
