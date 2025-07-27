import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMobileAlt, faPlayCircle, faQuestionCircle, faSearch, faServer, IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface HelpCategory {
    readonly icon: IconDefinition;
    readonly title: string;
    readonly description: string;
    readonly link: string;
}

interface FaqItem {
    readonly question: string;
    readonly answer: string;
}

@Component({
    selector: 'app-help-center',
    imports: [
        CommonModule,
        FormsModule,
        FontAwesomeModule,
        RouterLink,
    ],
    templateUrl: './help-center.html',
    styleUrl: './help-center.css',
})
export class HelpCenter implements OnInit {
    public readonly searchQuery: WritableSignal<string> = signal('');
    public readonly faqItems: Signal<readonly FaqItem[]> = signal([
        {
            question: 'Wie kann ich meine Medienbibliothek aktualisieren?',
            answer: 'Gehen Sie zu Einstellungen > Bibliothek und klicken Sie auf "Bibliothek scannen", um neue Medien hinzuzufügen.',
        },
        {
            question: 'Warum werden einige Videos nicht abgespielt?',
            answer: 'Stellen Sie sicher, dass das Videoformat unterstützt wird. Homeflix unterstützt MP4, MKV, AVI und die meisten gängigen Formate.',
        },
        {
            question: 'Kann ich Homeflix auf mehreren Geräten nutzen?',
            answer: 'Ja, Sie können Homeflix auf beliebig vielen Geräten in Ihrem Heimnetzwerk nutzen. Für externe Zugriffe benötigen Sie die entsprechende Konfiguration.',
        },
        {
            question: 'Wie kann ich Untertitel hinzufügen?',
            answer: 'Legen Sie SRT-Dateien mit dem gleichen Namen wie Ihre Videodatei im selben Ordner ab. Sie werden automatisch erkannt.',
        },
        {
            question: 'Ist meine Medienbibliothek sicher?',
            answer: 'Homeflix greift nur auf die Ordner zu, die Sie explizit freigegeben haben. Ihre Daten bleiben auf Ihrem eigenen Server und werden nicht extern gespeichert.',
        },
        {
            question: 'Was sind die Systemanforderungen für Homeflix?',
            answer: 'Homeflix benötigt ein Docker-fähiges System (Linux, macOS, Windows), mindestens 2GB RAM, ausreichend Speicherplatz für Ihre Medien und eine Netzwerkverbindung für das Streaming.',
        },
        {
            question: 'Welche Technologien werden bei Homeflix verwendet?',
            answer: 'Homeflix nutzt einen Node.js & Express Backend, PostgreSQL Datenbank, Angular Frontend und Docker für die einfache Bereitstellung.',
        },
        {
            question: 'Wie funktioniert die Installation von Homeflix?',
            answer: 'Installieren Sie Homeflix auf Ihrem Server oder NAS mit Docker, fügen Sie Ihre Filme und Serien hinzu (Homeflix organisiert sie automatisch) und streamen Sie dann von jedem Gerät in Ihrem Netzwerk.',
        },
        {
            question: 'Was sind die Hauptfunktionen von Homeflix?',
            answer: 'Die Hauptfunktionen umfassen Medien-Management mit automatischen Metadaten, Multi-Device Streaming auf allen Ihren Geräten sowie Sicherheit & Privatsphäre ohne Werbung, Tracking oder Datensammlung.',
        },
        {
            question: 'Kann ich auf Homeflix von außerhalb meines Heimnetzwerks zugreifen?',
            answer: 'Ja, mit der richtigen Konfiguration können Sie auch von außerhalb Ihres Heimnetzwerks auf Ihre Medien zugreifen. Weitere Details finden Sie in der Dokumentation.',
        },
    ]);

    public readonly filteredFaqs = computed<readonly FaqItem[]>(() => {
        const query = this.searchQuery().toLowerCase().trim();
        if (!query) return this.faqItems();

        return this.faqItems().filter(item =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query),
        );
    });

    protected readonly faSearch: IconDefinition = faSearch;
    protected readonly faPlayCircle: IconDefinition = faPlayCircle;
    protected readonly faServer: IconDefinition = faServer;
    protected readonly faMobileAlt: IconDefinition = faMobileAlt;
    protected readonly faQuestionCircle: IconDefinition = faQuestionCircle;
    public readonly helpCategories: Signal<readonly HelpCategory[]> = signal([
        {
            icon: this.faPlayCircle,
            title: 'Wiedergabeprobleme',
            description: 'Probleme mit der Videowiedergabe, Streaming-Qualität und Abspielfunktionen',
            link: '/help-center/playback',
        },
        {
            icon: this.faServer,
            title: 'Server & Bibliothek',
            description: 'Ihre Medienbibliothek organisieren, Server einrichten und verwalten',
            link: '/help-center/server',
        },
        {
            icon: this.faMobileAlt,
            title: 'Gerätekompatibilität',
            description: 'Unterstützte Geräte, mobile Apps und TV-Anwendungen',
            link: '/help-center/devices',
        },
        {
            icon: this.faQuestionCircle,
            title: 'Konto & Einstellungen',
            description: 'Kontoeinstellungen, Datenschutz und Benutzerprofileinstellungen',
            link: '/help-center/account',
        },
    ]);
    private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

    public ngOnInit(): void {
        this.activatedRoute.fragment.subscribe((fragment: string | null) => {
            if (fragment) {
                const element: HTMLElement | null = document.getElementById(fragment);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
}