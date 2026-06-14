import { Service } from '@angular/core';
import { WebHaptics } from 'web-haptics';

@Service()
export class HapticsService {
  private readonly haptics = new WebHaptics({ debug: true });

  correct() {
    this.haptics.cancel();
    this.haptics.trigger([{ duration: 12, intensity: 0.4 }]);
  }

  wrong() {
    this.haptics.cancel();
    this.haptics.trigger([
      { duration: 45, intensity: 1.0 },
      { duration: 45, intensity: 1.0, delay: 35 },
    ]);
  }

  erase() {
    this.haptics.cancel();
    this.haptics.trigger([{ duration: 8, intensity: 0.25 }]);
  }

  win() {
    this.haptics.cancel();
    this.haptics.trigger([
      { duration: 70, intensity: 0.5 },
      { duration: 70, intensity: 0.7, delay: 45 },
      { duration: 160, intensity: 1.0, delay: 45 },
    ]);
  }
}
