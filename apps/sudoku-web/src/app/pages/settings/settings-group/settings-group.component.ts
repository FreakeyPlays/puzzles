import { Component, input } from '@angular/core';

@Component({
  selector: 'app-settings-group',
  imports: [],
  templateUrl: './settings-group.component.html',
})
export class SettingsGroupComponent {
  readonly title = input.required<string>();
}
