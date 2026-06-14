import { Component, input } from '@angular/core';

@Component({
  selector: 'app-settings-item',
  imports: [],
  templateUrl: './settings-item.component.html',
})
export class SettingsItemComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
}
