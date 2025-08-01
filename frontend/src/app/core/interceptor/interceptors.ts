import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiErrorInterceptor } from './api-error-interceptor';
import { AuthInterceptor } from './auth-interceptor';
import { XsrfInterceptor } from './xsrf-interceptor';

export const interceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: ApiErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: XsrfInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

];