import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpErrorEnum } from '../enum/http-error-enum';
import { Auth } from '../services/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private readonly authService: Auth = inject(Auth);

    public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const requestWithCredentials = request.clone({
            withCredentials: true,
        });

        return next.handle(this.setCsrfHeader(requestWithCredentials)).pipe(
          catchError((error: HttpErrorResponse) => {
              if (error.status === HttpErrorEnum.UNAUTHORIZED && request.url.includes('refresh')) {
                  return this.handleLogout(error);
              } else if (error.status === HttpErrorEnum.UNAUTHORIZED) {
                  if (!this.hasAuthCookies()) {
                      return this.handleLogout(error);
                  }

                  return this.handleRefreshToken(requestWithCredentials, next);
              } else if (error.status === HttpErrorEnum.FORBIDDEN &&
                error.error?.code === 'CSRF_MISSING') {
                  return this.authService.getCsrfToken().pipe(
                    switchMap(() => next.handle(this.setCsrfHeader(requestWithCredentials))),
                    catchError((csrfError) => this.handleLogout(csrfError)),
                  );
              }

              return throwError(() => error);
          }),
        );
    }

    private handleRefreshToken(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return this.authService.getCsrfToken().pipe(
          switchMap((response) => {
              if (!response?.success) {
                  return this.handleLogout(new Error('Failed to get CSRF token'));
              }

              const csrfToken = response.data?.csrfToken;
              if (!csrfToken) {
                  return this.handleLogout(new Error('CSRF token is missing'));
              }

              const clonedRequest = request.clone({
                  headers: request.headers.set('X-CSRF-Token', csrfToken),
              });
              return next.handle(clonedRequest);
          }),
        );
    }

    private handleLogout(error: Error | HttpErrorResponse): Observable<never> {
        if (error instanceof HttpErrorResponse &&
          error.error?.code === 'INVALID_SESSION') {
            return throwError(() => error);
        }

        firstValueFrom(this.authService.logout());
        return throwError(() => error);
    }

    private setCsrfHeader(request: HttpRequest<unknown>): HttpRequest<unknown> {
        const csrfToken = this.extractCsrfTokenFromCookie();

        if (csrfToken && request.method !== 'GET') {
            return request.clone({
                headers: request.headers.set('X-CSRF-Token', csrfToken),
            });
        }

        return request;
    }

    private extractCsrfTokenFromCookie(): string | null {
        const match = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]*)/);
        return match ? match[1] : null;
    }

    private hasAuthCookies(): boolean {
        return document.cookie.includes('accessToken=');
    }
}