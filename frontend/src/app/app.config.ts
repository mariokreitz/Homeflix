import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
    ApplicationConfig,
    inject,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { csrfInterceptor } from './core/interceptor/csrf-interceptor';
import { Auth } from './core/services/auth';

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withInterceptors([ csrfInterceptor ])),
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideAppInitializer(() => {
            const authService = inject(Auth);
            return firstValueFrom(authService.initialize());
        }),
    ],
};