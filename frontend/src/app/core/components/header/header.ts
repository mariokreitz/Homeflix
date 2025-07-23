import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-header',
    imports: [
        NgOptimizedImage,
        RouterLink,
    ],
    templateUrl: './header.html',
    styleUrl: './header.css',
})
export class Header {

}
