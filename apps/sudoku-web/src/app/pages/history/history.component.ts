import { Component } from '@angular/core';

@Component({
  selector: 'app-history',
  imports: [],
  template: `
    <div class="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <h1 class="text-2xl font-bold text-foreground">History</h1>
      <p class="text-muted">Past games will appear here — coming soon.</p>
    </div>
  `,
})
export class HistoryComponent {}
