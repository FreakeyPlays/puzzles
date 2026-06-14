import { effect, inject, Service, signal, untracked } from '@angular/core';
import { StorageService } from './storage.service';

export interface AppSettings {
  hapticFeedback: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  hapticFeedback: true,
};

@Service()
export class SettingsService {
  private readonly storage = inject(StorageService);
  private readonly _settings = signal<AppSettings>(DEFAULT_SETTINGS);

  readonly settings = this._settings.asReadonly();

  constructor() {
    const persistedSettings = this.storage.readSettings();
    if (persistedSettings !== null) {
      this._settings.set(persistedSettings);
    }

    effect(() => {
      const settings = this._settings();
      untracked(() => {
        this.storage.writeSettings(settings);
      });
    });
  }

  update(patch: Partial<AppSettings>) {
    this._settings.update(current => ({ ...current, ...patch }));
  }
}
