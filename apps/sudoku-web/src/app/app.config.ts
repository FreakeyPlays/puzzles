import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, Router, withViewTransitions } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';

const NAV_ORDER = new Map<string, number>(
  routes
    .map((r) => [r.path, (r.data as { order: number } | undefined)?.order] as const)
    .filter((entry): entry is [string, number] => typeof entry[0] === 'string' && entry[1] != null),
);

function topSegment(url: string): string {
  return (
    url
      .replace(/[?#].*$/, '')
      .split('/')
      .filter(Boolean)
      .at(0) ?? ''
  );
}

function navDirection(fromUrl: string, toUrl: string): string {
  const from = topSegment(fromUrl);
  const to = topSegment(toUrl);

  if (from === 'game' || to === 'game') {
    return to === 'game' ? 'enter-game' : 'exit-game';
  }

  const fromIndex = NAV_ORDER.get(from) ?? 0;
  const toIdx = NAV_ORDER.get(to) ?? 0;

  if (toIdx > fromIndex) return 'forward';
  if (toIdx < fromIndex) return 'back';
  return 'none';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: () => {
          const router = inject(Router);
          const toUrl = router.currentNavigation()?.finalUrl?.toString() ?? '';
          document.documentElement.dataset['nav'] = navDirection(router.url, toUrl);
        },
      }),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
