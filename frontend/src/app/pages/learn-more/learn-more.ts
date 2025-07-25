import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngular, faDocker } from '@fortawesome/free-brands-svg-icons';
import { faCheck, faDatabase, faFilm, faMobile, faServer, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

interface FaqItem {
    question: string;
    answer: string;
}

@Component({
    selector: 'app-learn-more',
    standalone: true,
    imports: [
        NgOptimizedImage,
        RouterLink,
        FontAwesomeModule,
    ],
    templateUrl: './learn-more.html',
    styleUrl: './learn-more.css',
})
export class LearnMore {
    // Icons
    faFilm = faFilm;
    faMobile = faMobile;
    faShield = faShieldAlt;
    faCheck = faCheck;
    faServer = faServer;
    faDatabase = faDatabase;
    faAngular = faAngular;
    faDocker = faDocker;

    // FAQ Items
    faqItems: FaqItem[] = [
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
}