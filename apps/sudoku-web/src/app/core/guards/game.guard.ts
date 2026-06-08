import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { ACTIVE_PHASES } from '../models/app-state.model';
import { AppService } from '../services/app.service';

export const gameGuard: CanActivateFn = () => {
  const app = inject(AppService);
  const router = inject(Router);

  if (!ACTIVE_PHASES.includes(app.phase() as 'playing' | 'paused')) {
    return router.createUrlTree(['/']);
  }

  return true;
};
