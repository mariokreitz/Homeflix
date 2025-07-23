import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
    const auth: Auth = inject(Auth);
    return auth.isAuthenticated();
};
