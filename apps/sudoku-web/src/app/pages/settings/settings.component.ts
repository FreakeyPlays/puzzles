import { Component, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HapticsService } from '../../core/services/haptics.service';
import { SettingsService } from '../../core/services/settings.service';
import { SettingsGroupComponent } from './settings-group/settings-group.component';
import { SettingsItemComponent } from './settings-group/settings-item/settings-item.component';
import { SwitchComponent } from './settings-group/settings-item/switch/switch.component';
import { SelectComponent } from './settings-group/settings-item/select/select.component';

@Component({
  selector: 'app-settings',
  imports: [SettingsGroupComponent, SettingsItemComponent, SwitchComponent, SelectComponent],
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
        <app-settings-item title="Audio" description="Audio feedback on moves">
          <app-switch
            ariaLabel="Audio"
            [checked]="feedback().audio"
            (checkedChange)="onAudio($event)"
          />
        </app-settings-item>
      </app-settings-group>

      <app-settings-group title="Game">
        <app-settings-item title="Highlight Errors" description="Show incorrect numbers in red">
          <app-switch
            ariaLabel="Highlight Errors"
            [checked]="game().highlightErrors"
            (checkedChange)="onHighlightErrors($event)"
          />
        </app-settings-item>
        <app-settings-item
          title="Remove Used Numbers"
          description="Hide a number button when all its digits are placed"
        >
          <app-switch
            ariaLabel="Remove Used Numbers"
            [checked]="game().removeUsedNumbers"
            (checkedChange)="onRemoveUsedNumbers($event)"
          />
        </app-settings-item>
      </app-settings-group>

      <app-settings-group title="Appearance">
        <app-settings-item title="Theme" description="Choose your color scheme">
          <app-select
            ariaLabel="Theme"
            [options]="themeOptions"
            [value]="ui().theme"
            (valueChange)="onThemeSelect($event)"
          />
        </app-settings-item>
      </app-settings-group>

      <p class="px-1 text-center text-xs text-gray-400">{{ version }}</p>
    </div>
  `,
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly haptics = inject(HapticsService);

  readonly feedback = this.settingsService.feedback;
  readonly ui = this.settingsService.ui;
  readonly game = this.settingsService.game;

  readonly version = [
    environment.version,
    !environment.production && 'dev',
    environment.commitHash?.slice(0, 7),
  ]
    .filter(Boolean)
    .join(' · ');

  readonly themeOptions = [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  onVibrations(enabled: boolean) {
    this.settingsService.updateFeedback({ vibrations: enabled });
    if (enabled) {
      this.haptics.correct();
    }
  }

  onAudio(enabled: boolean) {
    this.settingsService.updateFeedback({ audio: enabled });
  }

  onThemeSelect(theme: string) {
    this.settingsService.updateUI({ theme: theme as 'system' | 'light' | 'dark' });
  }

  onHighlightErrors(enabled: boolean) {
    this.settingsService.updateGame({ highlightErrors: enabled });
  }

  onRemoveUsedNumbers(enabled: boolean) {
    this.settingsService.updateGame({ removeUsedNumbers: enabled });
  }
}
