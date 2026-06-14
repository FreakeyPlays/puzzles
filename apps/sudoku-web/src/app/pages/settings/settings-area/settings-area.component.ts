import { Component, input } from '@angular/core';

@Component({
  selector: 'app-settings-area',
  imports: [],
  template: `
    <section class="flex flex-col gap-2">
      <h2 class="px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">{{ title() }}</h2>
      <div class="overflow-hidden rounded-2xl bg-white shadow-sm divide-y divide-gray-100">
        <ng-content />
      </div>
    </section>
  `,
})
export class SettingsAreaComponent {
  readonly title = input.required<string>();
}
