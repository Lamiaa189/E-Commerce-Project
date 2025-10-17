import { CookieService } from 'ngx-cookie-service';
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const isLoggedGuard: CanActivateFn = (route, state) => {
  const cookieService = inject(CookieService);
  const router = inject(Router);

  return cookieService.get('token')? router.parseUrl('/home') : true;
};
