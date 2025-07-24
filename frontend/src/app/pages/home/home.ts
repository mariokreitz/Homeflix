import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent, IconDefinition } from '@fortawesome/angular-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-home',
    imports: [
        RouterLink,
        NgOptimizedImage,
        FaIconComponent,
    ],
    templateUrl: './home.html',
    styleUrl: './home.css',
})
export class Home {
    protected readonly faCircleInfo: IconDefinition = faCircleInfo;
}
