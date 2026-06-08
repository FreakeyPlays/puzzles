import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AppService } from './core/services/app.service';
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
    const app = inject(AppService);

    router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        if (
          !(e as NavigationEnd).urlAfterRedirects.startsWith('/game') &&
          app.phase() === 'playing'
        ) {
          app.pauseGame();
        }
        document.getElementById('main-content')?.focus({ preventScroll: true });
      });
  }
}
