import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { csrfInterceptor } from './core/interceptor/csrf-interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(
          withInterceptors([ csrfInterceptor ]),
        ),
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(routes),
    ],
};
