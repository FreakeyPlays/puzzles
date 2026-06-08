import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { BottomNavComponent } from './shared/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomNavComponent],
  templateUrl: './app.component.html',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }
  `,
})
export class AppComponent {
  constructor() {
    const router = inject(Router);
    const document = inject(DOCUMENT);

    router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(() => {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    });
  }
}
