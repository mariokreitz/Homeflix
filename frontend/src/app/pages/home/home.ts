import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-home',
    imports: [
        RouterLink,
        NgOptimizedImage,
    ],
    templateUrl: './home.html',
    styleUrl: './home.css',
})
export class Home {

}
