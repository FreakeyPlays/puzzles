import { afterNextRender, Component, ElementRef, inject } from '@angular/core';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-confetti',
  template: '',
})
export class ConfettiComponent {
  private readonly el = inject(ElementRef);

  constructor() {
    afterNextRender(() => {
      const dialog = (this.el.nativeElement as HTMLElement).closest('dialog');
      const rect = dialog?.getBoundingClientRect();

      if (!rect) return;

      const w = window.innerWidth;
      const h = window.innerHeight;

      const leftOrigin = { x: rect.left / w, y: (rect.top + rect.height * 0.6) / h };
      const rightOrigin = { x: rect.right / w, y: (rect.top + rect.height * 0.6) / h };

      this.fireCannon(leftOrigin, 65);
      this.fireCannon(rightOrigin, 115);
    });
  }

  private fireCannon(origin: confetti.Origin, angle: number): void {
    const base: confetti.Options = { origin, angle, spread: 35, startVelocity: 50 };
    void confetti({ ...base, particleCount: 60 });
    setTimeout(() => confetti({ ...base, particleCount: 40, spread: 25, startVelocity: 40 }), 200);
    setTimeout(() => confetti({ ...base, particleCount: 50, spread: 45, startVelocity: 55 }), 400);
  }
}
