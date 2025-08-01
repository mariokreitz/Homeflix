import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, firstValueFrom, Observable, switchMap, throwError } from 'rxjs';
import { HttpErrorEnum } from '../enum/http-error-enum';
import { Auth } from '../services/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private readonly authService: Auth = inject(Auth);

    public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(this.setXsrfHeader(request)).pipe(
          catchError((error: HttpErrorResponse) => {
              if (error.status === HttpErrorEnum.UNAUTHORIZED && request.url.includes('refresh')) {
                  firstValueFrom(this.authService.logout());
                  return throwError(() => error);
              } else if (error.status === HttpErrorEnum.UNAUTHORIZED) {
                  return this.handleRefreshToken(request, next);
              }

              return throwError(() => error);

          }),
        );
    }

    private handleRefreshToken(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return this.authService.refreshToken().pipe(
          switchMap((response) => {
              if (!response?.success) {
                  firstValueFrom(this.authService.logout());
                  return throwError(() => new Error('Session expired'));
              } else {
                  return next.handle(this.setXsrfHeader(request));
              }
          }),
        );
    }

    private setXsrfHeader(request: HttpRequest<unknown>): HttpRequest<unknown> {
        const match: RegExpMatchArray | null = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]*)/);
        const xsrfToken: string | undefined = match?.[1];

        return xsrfToken
          ? request.clone({ setHeaders: { 'x-xsrf-token': xsrfToken }, withCredentials: true })
          : request.clone({ withCredentials: true });
    }
}