import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Footer } from './core/components/footer/footer';
import { Header } from './core/components/header/header';
import { Auth } from './core/services/auth';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        Header,
        Footer,

    ],
    templateUrl: './app.html',
})
export class App {
    private readonly router = inject(Router);
    private readonly authService = inject(Auth);

    private readonly publicRoutes: string[] = [
        '/',
        '/home',
        '/login',
        '/register',
        '/faq',
        '/privacy-policy',
        '/help-center',
        '/cookie-settings',
        '/terms-of-use',
        '/legal-notice',
        '/media-center',
        '/contact',
        '/learn-more',
    ];

    shouldShowFooter = computed(() => {
        if (this.authService.isAuthenticated()) {
            return false;
        }

        const currentRoute = this.router.url;
        return this.publicRoutes.some(route =>
          currentRoute === route || currentRoute.startsWith(route + '?'),
        );
    });
}
