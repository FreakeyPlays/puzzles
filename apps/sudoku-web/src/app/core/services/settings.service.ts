import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { StorageService } from './storage.service';

export interface FeedbackSettings {
  vibrations: boolean;
  audio: boolean;
}

export interface UISettings {
  darkMode: boolean;
}

export interface GameSettings {
  highlightErrors: boolean;
}

export interface AppSettings {
  feedback: FeedbackSettings;
  ui: UISettings;
  game: GameSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  feedback: {
    vibrations: true,
    audio: false,
  },
  ui: {
    darkMode: false,
  },
  game: {
    highlightErrors: true,
  },
};

@Service()
export class SettingsService {
  private readonly storage = inject(StorageService);
  private readonly _settings = signal<AppSettings>(DEFAULT_SETTINGS);

  readonly feedback = computed(() => this._settings().feedback);
  readonly ui = computed(() => this._settings().ui);
  readonly game = computed(() => this._settings().game);

  constructor() {
    const persisted = this.storage.readSettings();
    if (persisted !== null) {
      this._settings.set({
        feedback: { ...DEFAULT_SETTINGS.feedback, ...persisted.feedback },
        ui: { ...DEFAULT_SETTINGS.ui, ...persisted.ui },
        game: { ...DEFAULT_SETTINGS.game, ...persisted.game },
      });
    }

    effect(() => {
      const settings = this._settings();
      untracked(() => {
        this.storage.writeSettings(settings);
      });
    });
  }

  updateFeedback(patch: Partial<FeedbackSettings>) {
    this._settings.update((s) => ({ ...s, feedback: { ...s.feedback, ...patch } }));
  }

  updateUI(patch: Partial<UISettings>) {
    this._settings.update((s) => ({ ...s, ui: { ...s.ui, ...patch } }));
  }

  updateGame(patch: Partial<GameSettings>) {
    this._settings.update((s) => ({ ...s, game: { ...s.game, ...patch } }));
  }
}
