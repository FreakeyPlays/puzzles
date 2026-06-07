import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AppService } from '../services/app.service';

export const gameGuard: CanActivateFn = () => {
  const app = inject(AppService);
  const router = inject(Router);

  if (app.phase() === 'idle') {
    return router.createUrlTree(['/home']);
  }

  return true;
};
