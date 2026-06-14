import { Component, computed, inject } from '@angular/core';
import { HapticsService } from '../../core/services/haptics.service';
import { SettingsService } from '../../core/services/settings.service';
import { SettingsAreaComponent } from './settings-area/settings-area.component';
import { SettingsOptionComponent } from './settings-area/settings-option/settings-option.component';
import { SwitchComponent } from './settings-area/settings-option/switch/switch.component';

@Component({
  selector: 'app-settings',
  imports: [SettingsAreaComponent, SettingsOptionComponent, SwitchComponent],
  template: `
    <div class="flex flex-col gap-6 px-4 py-6 max-w-md mx-auto w-full">
      <h1 class="px-1 text-2xl font-bold text-gray-900">Settings</h1>

      <app-settings-area title="Feedback">
        <app-settings-option title="Vibrations" description="Haptic feedback on moves">
          <app-switch
            ariaLabel="Vibrations"
            [checked]="hapticEnabled()"
            (checkedChange)="onHapticChange($event)"
          />
        </app-settings-option>
      </app-settings-area>
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
