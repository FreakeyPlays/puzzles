import { Component, computed, inject } from '@angular/core';
import { HapticsService } from '../../core/services/haptics.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  imports: [],
  template: `
    <div class="flex flex-col gap-6 px-4 py-6 max-w-md mx-auto w-full">
      <h1 class="px-1 text-2xl font-bold text-gray-900">Settings</h1>

      <section class="flex flex-col gap-2">
        <h2 class="px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Feedback</h2>
        <div class="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div class="flex items-center justify-between px-4 py-4">
            <div>
              <p class="text-base font-medium text-gray-900">Vibrations</p>
              <p class="text-sm text-gray-500">Haptic feedback on moves</p>
            </div>
            <button
              type="button"
              role="switch"
              [attr.aria-checked]="hapticEnabled()"
              (click)="toggleHaptics()"
              class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              [class.bg-blue-600]="hapticEnabled()"
              [class.bg-gray-200]="!hapticEnabled()"
            >
              <span
                class="pointer-events-none m-0.5 inline-block h-6 w-6 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out"
                [class.translate-x-5]="hapticEnabled()"
                [class.translate-x-0]="!hapticEnabled()"
              ></span>
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly haptics = inject(HapticsService);

  readonly hapticEnabled = computed(() => this.settingsService.settings().hapticFeedback);

  toggleHaptics() {
    const newValue = !this.hapticEnabled();
    this.settingsService.update({ hapticFeedback: newValue });
    if (newValue) {
      this.haptics.correct();
    }
  }
}
