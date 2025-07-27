import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { AuthFormComponent } from '../../shared/components/auth-form/auth-form';
import { FormFieldComponent } from '../../shared/components/form-field/form-field';
import { ApiErrorResponse } from '../../shared/models/api_response';
import { ErrorResponse } from '../../shared/models/auth';
import { useAuthForm } from '../../shared/utils/auth-form.utils';

@Component({
    selector: 'app-register',
    templateUrl: './register.html',
    styleUrl: './register.css',
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
export class Register {
    public readonly registerForm = useAuthForm({
        includeEmail: true,
        includeConfirmPassword: true,
    });
    protected readonly error = signal<string | null>(null);
    protected readonly isLoading = signal<boolean>(false);
    protected readonly success = signal<string | null>(null);

    private readonly router = inject(Router);
    private readonly authService = inject(Auth);

    public onSubmit(): void {
        this.error.set(null);
        this.success.set(null);

        if (!this.registerForm || this.registerForm.invalid) {
            this.error.set('Bitte füllen Sie alle Felder korrekt aus.');
            return;
        }

        const formValue = this.registerForm.value;
        const { email, password, confirmPassword } = formValue;

        if (!email || !password || !confirmPassword ||
          typeof email !== 'string' || typeof password !== 'string' || typeof confirmPassword !== 'string') {
            this.error.set('Alle Felder sind erforderlich.');
            return;
        }

        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            this.error.set('Felder dürfen nicht leer sein.');
            return;
        }

        if (password !== confirmPassword) {
            this.error.set('Die Passwörter stimmen nicht überein.');
            return;
        }

        this.isLoading.set(true);

        this.authService.register(email.trim(), password).subscribe({
            next: (res) => {
                try {
                    if (res?.success) {
                        this.authService.login(email.trim(), password).subscribe({
                            next: (loginRes) => {
                                if (loginRes?.success) {
                                    this.success.set('Registrierung und Anmeldung erfolgreich!');
                                    void this.router.navigate([ '/dashboard' ]);
                                } else {
                                    this.error.set('Registrierung erfolgreich, aber automatische Anmeldung fehlgeschlagen. Bitte melden Sie sich manuell an.');
                                }
                            },
                            error: (loginErr: ApiErrorResponse<ErrorResponse<{}>>) => {
                                const errorMessage = loginErr?.error?.message;
                                this.error.set(
                                  typeof errorMessage === 'string' && errorMessage.trim()
                                    ? `Registrierung erfolgreich, aber Anmeldung fehlgeschlagen: ${errorMessage}`
                                    : 'Registrierung erfolgreich, aber automatische Anmeldung fehlgeschlagen.',
                                );
                            },
                            complete: () => {
                                this.isLoading.set(false);
                            },
                        });
                    } else {
                        this.error.set('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
                        this.isLoading.set(false);
                    }
                } catch (error) {
                    console.error('Registration processing error:', error);
                    this.error.set('Ein unerwarteter Fehler ist aufgetreten.');
                    this.isLoading.set(false);
                }
            },
            error: (err: ApiErrorResponse<ErrorResponse>) => {
                const errorMessage = err.error.message;
                this.error.set(
                  errorMessage
                    ? errorMessage
                    : 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.',
                );
                this.isLoading.set(false);
            },
        });
    }
}
