import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
    const authService: Auth = inject(Auth);
    const router: Router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    } else {
        router.navigate([ '/' ]);
        return false;
    }
};
