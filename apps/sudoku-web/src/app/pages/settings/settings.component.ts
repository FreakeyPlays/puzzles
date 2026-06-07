import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  imports: [],
  template: `
    <div class="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
      <p class="text-gray-500">Theme, accessibility, and game preferences — coming soon.</p>
    </div>
  `,
})
export class SettingsComponent {}
