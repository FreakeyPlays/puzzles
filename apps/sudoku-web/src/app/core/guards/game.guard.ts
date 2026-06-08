import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { isActiveAppStatus } from '../models/app-state.model';
import { AppService } from '../services/app.service';

export const gameGuard: CanActivateFn = () => {
  const app = inject(AppService);
  const router = inject(Router);

  if (!isActiveAppStatus(app.phase())) {
    return router.createUrlTree(['/']);
  }

  return true;
};
