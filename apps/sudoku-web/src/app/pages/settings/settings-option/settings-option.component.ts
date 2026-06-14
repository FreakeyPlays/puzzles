import { Component, input } from '@angular/core';

@Component({
  selector: 'app-settings-option',
  imports: [],
  template: `
    <div class="flex items-center justify-between gap-4 px-4 py-4">
      <div>
        <p class="text-base font-medium text-gray-900">{{ title() }}</p>
        @if (description()) {
          <p class="text-sm text-gray-500">{{ description() }}</p>
        }
      </div>
      <ng-content />
    </div>
  `,
})
export class SettingsOptionComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
}
