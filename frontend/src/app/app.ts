import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
export class App {
}
