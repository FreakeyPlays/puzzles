import { Component, inject } from '@angular/core';
import { HapticsService } from '../../core/services/haptics.service';
import { SettingsService } from '../../core/services/settings.service';
import { SettingsGroupComponent } from './settings-group/settings-group.component';
import { SettingsItemComponent } from './settings-group/settings-item/settings-item.component';
import { SwitchComponent } from './settings-group/settings-item/switch/switch.component';

@Component({
  selector: 'app-settings',
  imports: [SettingsGroupComponent, SettingsItemComponent, SwitchComponent],
  template: `
    <div class="flex flex-col gap-6 px-4 py-6 max-w-md mx-auto w-full">
      <h1 class="px-1 text-2xl font-bold text-gray-900">Settings</h1>

      <app-settings-group title="Feedback">
        <app-settings-item title="Vibrations" description="Haptic feedback on moves">
          <app-switch
            ariaLabel="Vibrations"
            [checked]="feedback().vibrations"
            (checkedChange)="onVibrations($event)"
          />
        </app-settings-item>
      </app-settings-group>

      <app-settings-group title="Appearance">
        <app-settings-item title="Dark Mode" description="Use a dark color scheme">
          <app-switch
            ariaLabel="Dark Mode"
            [checked]="ui().darkMode"
            (checkedChange)="onDarkMode($event)"
          />
        </app-settings-item>
      </app-settings-group>
    </div>
  `,
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly haptics = inject(HapticsService);

  readonly feedback = this.settingsService.feedback;
  readonly ui = this.settingsService.ui;

  onVibrations(enabled: boolean) {
    this.settingsService.updateFeedback({ vibrations: enabled });
    if (enabled) {
      this.haptics.correct();
    }
  }

  onDarkMode(enabled: boolean) {
    this.settingsService.updateUI({ darkMode: enabled });
  }
}
