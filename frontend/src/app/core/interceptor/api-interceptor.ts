import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Auth } from '../services/auth';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(Auth);
    const csrfToken = auth.csrfToken();
    const accessToken = auth.accessToken();

    // Prüfen, ob die Anfrage an die API geht
    if (req.url.includes(environment.apiUrl)) {
        let modifiedReq = req;

        // Authorization Header hinzufügen, wenn Access-Token vorhanden
        if (accessToken) {
            modifiedReq = modifiedReq.clone({
                headers: modifiedReq.headers.set('Authorization', `Bearer ${accessToken}`),
            });
        }

        // CSRF-Token für nicht-GET-Anfragen hinzufügen
        if (csrfToken && req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
            modifiedReq = modifiedReq.clone({
                headers: modifiedReq.headers.set('X-CSRF-Token', csrfToken),
            });
        }

        return next(modifiedReq);
    }

    return next(req);
};