import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { User } from '../services/user';

export const noAuthGuard: CanActivateFn = () => {
    const userService: User = inject(User);
    const router = inject(Router);

    if (userService.isLoggedIn()) {
        router.navigate([ '/dashboard' ]);
        return false;
    }

    return true;
};

