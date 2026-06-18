import { Routes } from '@angular/router';
import { gameGuard } from './core/guards/game.guard';

export const routes: Routes = [
  {
    path: '',
    data: { order: 0 },
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'game',
    canActivate: [gameGuard],
    loadComponent: () => import('./pages/game/game.component').then((m) => m.GameComponent),
  },
  {
    path: 'history',
    data: { order: 1 },
    loadComponent: () =>
      import('./pages/history/history.component').then((m) => m.HistoryComponent),
  },
  {
    path: 'settings',
    data: { order: 2 },
    loadComponent: () =>
      import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
  },
  { path: '**', redirectTo: '/' },
];
