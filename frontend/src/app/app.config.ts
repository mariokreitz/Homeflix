import { provideHttpClient, withInterceptorsFromDi, withXsrfConfiguration } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { interceptorProviders } from './core/interceptor/interceptors';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        interceptorProviders,
        provideHttpClient(
          withXsrfConfiguration({
              cookieName: 'csrfToken',
              headerName: 'x-xsrf-token',
          }),
          withInterceptorsFromDi(),
        ),
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
    ],
};