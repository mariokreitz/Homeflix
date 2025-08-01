import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class XsrfInterceptor implements HttpInterceptor {
    public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const match: RegExpMatchArray | null = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]*)/);
        const xsrfToken: string | undefined = match?.[1];

        const cloned: HttpRequest<unknown> = xsrfToken
          ? req.clone({ setHeaders: { 'x-xsrf-token': xsrfToken }, withCredentials: true })
          : req.clone({ withCredentials: true });

        return next.handle(cloned);
    }
}