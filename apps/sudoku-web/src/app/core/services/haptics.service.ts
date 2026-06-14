import { inject, Service } from '@angular/core';
import { WebHaptics } from 'web-haptics';
import { SettingsService } from './settings.service';

@Service()
export class HapticsService {
  private readonly haptics = new WebHaptics({ debug: true });
  private readonly settings = inject(SettingsService);

  private get enabled() {
    return this.settings.settings().hapticFeedback;
  }

  correct() {
    if (!this.enabled) return;
    this.haptics.cancel();
    this.haptics.trigger([{ duration: 12, intensity: 0.4 }]);
  }

  wrong() {
    if (!this.enabled) return;
    this.haptics.cancel();
    this.haptics.trigger([
      { duration: 45, intensity: 1.0 },
      { duration: 45, intensity: 1.0, delay: 35 },
    ]);
  }

  erase() {
    if (!this.enabled) return;
    this.haptics.cancel();
    this.haptics.trigger([{ duration: 8, intensity: 0.25 }]);
  }

  win() {
    if (!this.enabled) return;
    this.haptics.cancel();
    this.haptics.trigger([
      { duration: 70, intensity: 0.5 },
      { duration: 70, intensity: 0.7, delay: 45 },
      { duration: 160, intensity: 1.0, delay: 45 },
    ]);
  }
}
