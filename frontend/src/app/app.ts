import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Footer } from './core/components/footer/footer';
import { Header } from './core/components/header/header';

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
    private readonly router: Router = inject(Router);

    public ngOnInit(): void {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'instant',
                });
            }
        });
    }
}