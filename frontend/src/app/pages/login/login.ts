import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { AuthFormComponent } from '../../shared/components/auth-form/auth-form';
import { FormFieldComponent } from '../../shared/components/form-field/form-field';
import { ApiErrorResponse, ApiSuccessResponse } from '../../shared/models/api_response';
import { ErrorResponse, LoginResponse } from '../../shared/models/auth';
import { useAuthForm } from '../../shared/utils/auth-form.utils';

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrl: './login.css',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        AuthFormComponent,
        FormFieldComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
    public readonly loginForm = useAuthForm({
        includeEmail: true,
    });
    protected readonly error = signal<string | null>(null);
    protected readonly isLoading = signal<boolean>(false);

    private readonly router = inject(Router);
    private readonly authService = inject(Auth);

    public onSubmit(): void {
        this.error.set(null);

        if (!this.loginForm || this.loginForm.invalid) {
            this.error.set('Bitte füllen Sie alle Felder korrekt aus.');
            return;
        }

        const formValue = this.loginForm.value;
        const { email, password } = formValue;

        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            this.error.set('E-Mail und Passwort sind erforderlich.');
            return;
        }

        if (!email.trim() || !password.trim()) {
            this.error.set('E-Mail und Passwort dürfen nicht leer sein.');
            return;
        }

        this.isLoading.set(true);

        this.authService.login(email.trim(), password).subscribe({
            next: (response: ApiSuccessResponse<LoginResponse, {}>) => {
                try {
                    if (response?.success) {
                        void this.router.navigate([ '/dashboard' ]);
                    } else {
                        this.error.set('Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.');
                    }
                } catch (error) {
                    console.error('Navigation error:', error);
                    this.error.set('Ein unerwarteter Fehler ist aufgetreten.');
                }
            },
            error: (err: ApiErrorResponse<ErrorResponse<{}>>) => {
                const errorMessage = err?.error?.message;
                this.error.set(
                  typeof errorMessage === 'string' && errorMessage.trim()
                    ? errorMessage
                    : 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.',
                );
            },
            complete: () => {
                this.isLoading.set(false);
            },
        });
    }
}
