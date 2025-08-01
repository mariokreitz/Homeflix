import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './core/components/footer/footer';
import { Header } from './core/components/header/header';
import { Auth } from './core/services/auth';
import { User } from './core/services/user';

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
export class App implements OnInit {
    private readonly auth = inject(Auth);
    private readonly user = inject(User);

    public ngOnInit(): void {
        this.auth.verifySession().subscribe({
            next: (response) => {
                if (response?.success && response.data?.sessionId) {
                    // Optional: Userdaten nachladen, falls nötig
                    // this.user.setUser(...);
                }
            },
            error: () => {
                this.user.clearUser();
            },
        });
    }
}