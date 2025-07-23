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
                // Handle successful logout
                console.log('Logout successful');
            },
            error: (err) => {
                // Handle error during logout
                console.error('Logout failed', err);
            },
        });
    }

}
