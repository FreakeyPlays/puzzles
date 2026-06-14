import { Component, input } from '@angular/core';

@Component({
  selector: 'app-settings-option',
  imports: [],
  templateUrl: './settings-option.component.html',
})
export class SettingsOptionComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
}
