import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngular, faDocker } from '@fortawesome/free-brands-svg-icons';
import { faCheck, faDatabase, faFilm, faMobile, faServer, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

interface FaqItem {
    readonly question: string;
    readonly answer: string;
}

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
export class LearnMore implements OnInit {
    public readonly faFilm = faFilm;
    public readonly faMobile = faMobile;
    public readonly faShield = faShieldAlt;
    public readonly faCheck = faCheck;
    public readonly faServer = faServer;
    public readonly faDatabase = faDatabase;
    public readonly faAngular = faAngular;
    public readonly faDocker = faDocker;

    public readonly faqItems: readonly FaqItem[] = [
        {
            question: 'Ist Homeflix kostenlos?',
            answer: 'Ja, Homeflix ist eine Open-Source-Software und kann kostenlos genutzt werden. Du benötigst lediglich die Hardware, auf der du Homeflix betreibst.',
        },
        {
            question: 'Welche Medienformate werden unterstützt?',
            answer: 'Homeflix unterstützt die gängigsten Video- und Audioformate wie MP4, MKV, AVI, MP3 und mehr. Eine vollständige Liste findest du in der Dokumentation.',
        },
        {
            question: 'Kann ich Homeflix auch außerhalb meines Heimnetzwerks nutzen?',
            answer: 'Ja, mit entsprechender Konfiguration kannst du auch von unterwegs auf deine Medien zugreifen. Beachte dabei jedoch die Sicherheitseinstellungen.',
        },
        {
            question: 'Werden automatisch Metadaten für meine Medien geladen?',
            answer: 'Ja, Homeflix kann automatisch Metadaten wie Titel, Beschreibungen, Cover und mehr aus Online-Datenbanken abrufen und deinen Medien zuordnen.',
        },
    ];

    private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

    public ngOnInit() {
        this.activatedRoute.fragment.subscribe((fragment: string | null) => {
            if (fragment) {
                const element: HTMLElement | null = document.getElementById(fragment);
                if (element !== null && element !== undefined) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
}