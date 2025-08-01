import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { User } from '../services/user';

export const authGuard: CanActivateFn = (route, state) => {
    const userService: User = inject(User);
    const router: Router = inject(Router);

    if (userService.isLoggedIn()) {
        return true;
    } else {
        router.navigate([ '/' ]);
        return false;
    }
};
