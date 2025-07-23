import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const csrfInterceptor: HttpInterceptorFn = (request, next) => {
    const auth = inject(Auth);
    const csrfToken = auth.csrfToken();

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
