import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent, IconDefinition } from '@fortawesome/angular-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Footer } from '../../core/components/footer/footer';
import { Header } from '../../core/components/header/header';

@Component({
    selector: 'app-home',
    imports: [
        RouterLink,
        NgOptimizedImage,
        FaIconComponent,
        Footer,
        Header,
    ],
    templateUrl: './home.html',
    styleUrl: './home.css',
})
export class Home {
    protected readonly faCircleInfo: IconDefinition = faCircleInfo;
}
