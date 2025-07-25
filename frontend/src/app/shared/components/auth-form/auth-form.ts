import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-auth-form',
    imports: [
        CommonModule,
        ReactiveFormsModule,
    ],
    template: `
			<form [formGroup]="form()" (ngSubmit)="handleSubmit()" class="flex flex-col space-y-6">
				<ng-content></ng-content>
				<button
							[disabled]="form().invalid || isLoading()"
							[attr.aria-busy]="isLoading()"
							[attr.aria-describedby]="error() ? 'form-error' : null"
							class="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded font-medium transition-colors disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
							type="submit"
				>
					@if (isLoading()) {
						<span aria-hidden="true">{{ loadingText() }}</span>
					} @else {
						<span>{{ submitText() }}</span>
					}
				</button>
				@if (error()) {
					<div
								id="form-error"
								class="bg-red-600/20 text-red-500 p-4 mt-4 rounded"
								role="alert"
								aria-live="polite"
					>
						{{ error() }}
					</div>
				}
				@if (success()) {
					<div
								class="bg-green-600/20 text-green-500 p-4 mt-4 rounded"
								role="status"
								aria-live="polite"
					>
						{{ success() }}
					</div>
				}
			</form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthFormComponent {
    public readonly form = input.required<FormGroup>();
    public readonly submitText = input<string>('Absenden');
    public readonly loadingText = input<string>('Wird gesendet...');
    public readonly error = input<string | null>(null);
    public readonly success = input<string | null>(null);
    public readonly isLoading = input<boolean>(false);

    public readonly submit = output<void>();

    public handleSubmit(): void {
        const currentForm = this.form();

        if (!currentForm || typeof currentForm.invalid === 'undefined') {
            console.error('Invalid form provided to AuthFormComponent');
            return;
        }

        if (currentForm.invalid) {
            this.markAllFieldsAsTouched(currentForm);
            return;
        }

        try {
            this.submit.emit();
        } catch (error) {
            console.error('Error emitting form submit:', error);
        }
    }

    private markAllFieldsAsTouched(form: FormGroup): void {
        if (!form || !form.controls) {
            return;
        }

        try {
            Object.keys(form.controls).forEach(key => {
                const control = form.get(key);
                if (control && typeof control.markAsTouched === 'function') {
                    control.markAsTouched();
                    if (typeof control.updateValueAndValidity === 'function') {
                        control.updateValueAndValidity();
                    }
                }
            });
        } catch (error) {
            console.error('Error marking form fields as touched:', error);
        }
    }
}
