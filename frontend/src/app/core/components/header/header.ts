import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiErrorResponse } from '../../../shared/models/api_response';
import { ErrorResponse } from '../../../shared/models/auth';
import { UserInterface } from '../../../shared/models/user';
import { Auth } from '../../services/auth';
import { User } from '../../services/user';

@Component({
    selector: 'app-header',
    imports: [
        NgOptimizedImage,
        RouterLink,
    ],
    templateUrl: './header.html',
    styleUrl: './header.css',
    standalone: true,
})
export class Header {
    public readonly userName = computed((): string => {
        const user = this.user();
        return user?.email ?? 'Benutzer';
    });
    public readonly profileInitial = computed((): string => {
        const name = this.userName();
        return name?.charAt(0)?.toUpperCase() ?? 'B';
    });
    private readonly authService = inject(Auth);
    public readonly isAuthenticated = computed((): boolean => this.authService.isAuthenticated());
    private readonly userService = inject(User);
    public readonly user = computed((): UserInterface | null => this.userService.user());
    private readonly router = inject(Router);
    public readonly showLoginButton = computed((): boolean =>
      !this.isAuthenticated() && (this.router.url !== '/login'),
    );

    public onLogout(): void {
        try {
            this.authService.logout().subscribe({
                next: () => {
                    this.router.navigate([ '/' ]);
                },
                error: (err: ApiErrorResponse<ErrorResponse>) => {
                    console.error('Logout fehlgeschlagen', err);
                },
            });
        } catch (error: unknown) {
            console.error('Logout Exception', error);
        }
    }
}
