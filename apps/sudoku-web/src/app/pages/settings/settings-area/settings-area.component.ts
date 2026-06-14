import { Component, input } from '@angular/core';

@Component({
  selector: 'app-settings-area',
  imports: [],
  templateUrl: './settings-area.component.html',
})
export class SettingsAreaComponent {
  readonly title = input.required<string>();
}
