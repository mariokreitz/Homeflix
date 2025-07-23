import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const csrfInterceptor: HttpInterceptorFn = (request, next) => {
    const authService = inject(Auth);
    const csrfToken = authService.csrfToken();

    let req = request.clone({
        withCredentials: true,
    });

    if (csrfToken) {
        req = req.clone({
            setHeaders: {
                'X-CSRF-Token': csrfToken,
            },
        });
    }

    return next(req);
};
