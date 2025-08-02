import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiErrorResponse } from '../../shared/models/api_response';
import { ErrorResponse } from '../../shared/models/auth';

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
    public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(request).pipe(
          catchError((responseError: HttpErrorResponse): Observable<never> => {
              const error: ApiErrorResponse<ErrorResponse> = responseError.error;

              if (environment.production) return throwError((): string => error?.message);
              if (!error || responseError.status === 0) {
                  console.debug({
                      status: responseError.status,
                      message: responseError.statusText,
                      url: responseError.url,
                  });
              } else {
                  console.debug(error);
              }

              return throwError((): string => error?.message);
          }),
        );
    }
}