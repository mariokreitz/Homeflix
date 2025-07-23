import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { ApiErrorResponse, ApiSuccessResponse } from '../../shared/models/api_response';
import { ErrorResponse, LoginResponse } from '../../shared/models/auth';

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterLink,
        NgOptimizedImage,
    ],
})
export class Login {
    loginForm: FormGroup;
    protected readonly error = signal<string | null>(null);
    protected readonly isLoading = signal<boolean>(false);

    private readonly fb: FormBuilder = inject(FormBuilder);
    private readonly router: Router = inject(Router);
    private readonly auth: Auth = inject(Auth);

    constructor() {
        this.loginForm = this.fb.group({
            email: [
                '',
                [
                    Validators.required,
                    Validators.email,
                ],
            ],
            password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(6),
                ],
            ],
        });
    }

    public onSubmit(): void {
        this.isLoading.set(true);
        this.auth.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
            next: (response: ApiSuccessResponse<LoginResponse, {}>) => {
                if (response.success) {
                    void this.router.navigate([ '/dashboard' ]);
                }
            },
            error: (err: ApiErrorResponse<ErrorResponse<{}>>) => {
                console.error('err response:', err);

                this.error.set(err.error.message);
            },
            complete: () => {
                this.isLoading.set(false);
            },
        });
    }
}

