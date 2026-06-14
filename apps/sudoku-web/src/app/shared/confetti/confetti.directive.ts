import { afterNextRender, Directive } from '@angular/core';
import confetti, {
  type Options as ConfettiOptions,
  Origin as ConfettoOrigin,
} from 'canvas-confetti';

const MOBILE_WIDTH = 390;
const DESKTOP_WIDTH = 1440;
const MAX_VELOCITY_BOOST = 20;
const MAX_COUNT_BOOST = 0.5;

const CANNON_Y = 0.8;
const CANNON_ANGLE = 90;

const BURST_1_COUNT = 60;
const BURST_1_VELOCITY = 50;
const BURST_1_SPREAD = 35;

const BURST_2_COUNT = 40;
const BURST_2_VELOCITY = 40;
const BURST_2_SPREAD = 25;
const BURST_2_DELAY = 200;

const BURST_3_COUNT = 50;
const BURST_3_VELOCITY = 55;
const BURST_3_SPREAD = 45;
const BURST_3_DELAY = 400;

@Directive({
  selector: '[appConfetti]',
})
export class ConfettiDirective {
  constructor() {
    afterNextRender(() => {
      const scale = Math.max(
        0,
        Math.min(1, (window.innerWidth - MOBILE_WIDTH) / (DESKTOP_WIDTH - MOBILE_WIDTH)),
      );
      const velocityBoost = scale * MAX_VELOCITY_BOOST;
      const countScale = 1 + scale * MAX_COUNT_BOOST;

      this.fireCannon({ x: 0, y: CANNON_Y }, CANNON_ANGLE, velocityBoost, countScale);
      this.fireCannon({ x: 1, y: CANNON_Y }, CANNON_ANGLE, velocityBoost, countScale);
    });
  }

  private fireCannon(
    origin: ConfettoOrigin,
    angle: number,
    velocityBoost: number,
    countScale: number,
  ): void {
    const base: ConfettiOptions = {
      origin,
      angle,
      spread: BURST_1_SPREAD,
      startVelocity: BURST_1_VELOCITY + velocityBoost,
    };
    void confetti({ ...base, particleCount: Math.round(BURST_1_COUNT * countScale) });
    setTimeout(
      () =>
        confetti({
          ...base,
          particleCount: Math.round(BURST_2_COUNT * countScale),
          spread: BURST_2_SPREAD,
          startVelocity: BURST_2_VELOCITY + velocityBoost,
        }),
      BURST_2_DELAY,
    );
    setTimeout(
      () =>
        confetti({
          ...base,
          particleCount: Math.round(BURST_3_COUNT * countScale),
          spread: BURST_3_SPREAD,
          startVelocity: BURST_3_VELOCITY + velocityBoost,
        }),
      BURST_3_DELAY,
    );
  }
}
