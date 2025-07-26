import { Component, inject } from '@angular/core';
import { Auth } from '../../core/services/auth';

@Component({
    selector: 'app-dashboard',
    imports: [],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
})
export class Dashboard {
    private readonly authService: Auth = inject(Auth);

    public onLogout() {
        this.authService.logout().subscribe({
            next: () => {
                console.info('Logout successful');
            },
            error: (err) => {
                console.error('Logout failed', err);
            },
        });
    }

}
