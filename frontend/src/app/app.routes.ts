import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { noAuthGuard } from './core/guards/no-auth-guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home').then(m => m.Home),
        canActivate: [ noAuthGuard ],
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.Login),
        canActivate: [ noAuthGuard ],
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then(m => m.Register),
        canActivate: [ noAuthGuard ],
    },
    {
        path: 'learn-more',
        loadComponent: () => import('./pages/learn-more/learn-more').then(m => m.LearnMore),
    },
    {
        path: 'privacy-policy',
        loadComponent: () => import('./pages/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy),
    },
    {
        path: 'help-center',
        loadComponent: () => import('./pages/help-center/help-center').then(m => m.HelpCenter),
    },
    {
        path: 'cookie-settings',
        loadComponent: () => import('./pages/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy),
    },
    {
        path: 'terms-of-use',
        loadComponent: () => import('./pages/terms-of-use/terms-of-use').then(m => m.TermsOfUse),
    },
    {
        path: 'legal-notice',
        loadComponent: () => import('./pages/terms-of-use/terms-of-use').then(m => m.TermsOfUse),
    },
    {
        path: 'media-center',
        loadComponent: () => import('./pages/terms-of-use/terms-of-use').then(m => m.TermsOfUse),
    },
    {
        path: 'contact',
        loadComponent: () => import('./pages/terms-of-use/terms-of-use').then(m => m.TermsOfUse),
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
        canActivate: [ authGuard ],
    },
    {
        path: '**',
        redirectTo: '',
    },
];