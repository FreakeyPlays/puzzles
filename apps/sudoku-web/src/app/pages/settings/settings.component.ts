import { Component, computed, inject } from '@angular/core';
import { HapticsService } from '../../core/services/haptics.service';
import { SettingsService } from '../../core/services/settings.service';
import { SwitchComponent } from '../../shared/components/switch/switch.component';

@Component({
  selector: 'app-settings',
  imports: [SwitchComponent],
  template: `
    <div class="flex flex-col gap-6 px-4 py-6 max-w-md mx-auto w-full">
      <h1 class="px-1 text-2xl font-bold text-gray-900">Settings</h1>

      <section class="flex flex-col gap-2">
        <h2 class="px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Feedback</h2>
        <div class="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div class="px-4 py-4">
            <app-switch
              label="Vibrations"
              description="Haptic feedback on moves"
              [checked]="hapticEnabled()"
              (checkedChange)="onHapticChange($event)"
            />
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

  onHapticChange(enabled: boolean) {
    this.settingsService.update({ hapticFeedback: enabled });
    if (enabled) {
      this.haptics.correct();
    }
  }
}
