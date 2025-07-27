import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngular, faDocker } from '@fortawesome/free-brands-svg-icons';
import { faCheck, faDatabase, faFilm, faMobile, faServer, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-learn-more',
    imports: [
        NgOptimizedImage,
        RouterLink,
        FontAwesomeModule,
    ],
    templateUrl: './learn-more.html',
    styleUrl: './learn-more.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnMore {
    protected readonly faFilm = faFilm;
    protected readonly faMobile = faMobile;
    protected readonly faShield = faShieldAlt;
    protected readonly faCheck = faCheck;
    protected readonly faServer = faServer;
    protected readonly faDatabase = faDatabase;
    protected readonly faAngular = faAngular;
    protected readonly faDocker = faDocker;

}