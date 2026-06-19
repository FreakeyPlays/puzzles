import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { StorageService } from './storage.service';

export interface FeedbackSettings {
  vibrations: boolean;
  audio: boolean;
}

export interface UISettings {
  theme: 'system' | 'dark' | 'light';
}

export interface GameSettings {
  highlightErrors: boolean;
  removeUsedNumbers: boolean;
}

export interface AppSettings {
  feedback: FeedbackSettings;
  ui: UISettings;
  game: GameSettings;
}

const THEME_COLOR_LIGHT = '#f9fafb';
const THEME_COLOR_DARK = '#0a0a0a';

const DEFAULT_SETTINGS: AppSettings = {
  feedback: {
    vibrations: true,
    audio: false,
  },
  ui: {
    theme: 'system',
  },
  game: {
    highlightErrors: true,
    removeUsedNumbers: true,
  },
};

@Service()
export class SettingsService {
  private readonly storage = inject(StorageService);
  private readonly document = inject(DOCUMENT);
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

    effect(() => {
      const theme = this.ui().theme;

      const isExplicit = theme === 'dark' || theme === 'light';
      const prefersDarkMode = isExplicit
        ? theme === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;

      this.applyThemeClass(prefersDarkMode, isExplicit);
      this.syncThemeColorMetaTag(prefersDarkMode, isExplicit);
    });
  }

  private applyThemeClass(prefersDarkMode: boolean, isExplicit: boolean) {
    if (isExplicit) this.document.documentElement.classList.toggle('dark', prefersDarkMode);
  }

  private syncThemeColorMetaTag(prefersDarkMode: boolean, isExplicit: boolean) {
    this.document.querySelectorAll('meta[name="theme-color"]').forEach((el) => el.remove());

    const add = (prefersDarkMode: boolean, mediaQuery?: string) => {
      const meta = this.document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = prefersDarkMode ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
      if (mediaQuery) meta.media = mediaQuery;
      this.document.head.appendChild(meta);
    };

    if (isExplicit) {
      add(prefersDarkMode);
    } else {
      add(false, '(prefers-color-scheme: light)');
      add(true, '(prefers-color-scheme: dark)');
    }
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
