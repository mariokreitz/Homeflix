import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, OnChanges, OnDestroy, signal } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { getValidationErrorMessage } from '../../utils/form.utils';

export type FieldType = 'text' | 'email' | 'password';

interface ControlState {
    readonly invalid: boolean;
    readonly touched: boolean;
    readonly dirty: boolean;
    readonly errors: Record<string, unknown> | null;
}

@Component({
    selector: 'app-form-field',
    imports: [
        CommonModule,
        ReactiveFormsModule,
    ],
    template: `
			<div [formGroup]="form()">
				<input
							[attr.aria-label]="label()"
							[attr.aria-describedby]="shouldShowError() ? controlName() + '-error' : null"
							[attr.aria-invalid]="shouldShowError()"
							[attr.autocomplete]="autocomplete()"
							[formControlName]="controlName()"
							[placeholder]="placeholder()"
							[type]="type()"
							class="w-full bg-gray-800 text-white p-4 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
							(blur)="onBlur()"
				/>
				@if (shouldShowError()) {
					<p
								[id]="controlName() + '-error'"
								class="text-red-500 text-sm mt-1"
								role="alert"
								aria-live="polite"
					>
						{{ activeErrorMessage() }}
					</p>
				}
			</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent implements OnChanges, OnDestroy {
    public readonly form = input.required<FormGroup>();
    public readonly controlName = input.required<string>();
    public readonly label = input.required<string>();
    public readonly type = input<FieldType>('text');
    public readonly placeholder = input<string>('');
    public readonly autocomplete = input<string>('');
    public readonly errorMessage = input<string | null>(null);

    private readonly control = computed<AbstractControl | null>(() => {
        const formValue = this.form();
        const controlNameValue = this.controlName();

        if (!formValue || !controlNameValue || typeof controlNameValue !== 'string') {
            return null;
        }

        return formValue.get(controlNameValue) ?? null;
    });

    private readonly controlStatus = signal<ControlState>({
        invalid: false,
        touched: false,
        dirty: false,
        errors: null,
    });

    public readonly shouldShowError = computed<boolean>(() => {
        const { invalid, touched, dirty } = this.controlStatus();
        return invalid && (touched || dirty);
    });

    public readonly activeErrorMessage = computed<string>(() => {
        const customMessage = this.errorMessage();

        if (customMessage && typeof customMessage === 'string') {
            return customMessage;
        }

        const { errors } = this.controlStatus();
        if (!errors || typeof errors !== 'object') {
            return '';
        }

        const errorKeys = Object.keys(errors);
        const firstError = errorKeys[0];

        if (!firstError) {
            return '';
        }

        try {
            return getValidationErrorMessage(firstError, errors[firstError] as Record<string, unknown>);
        } catch (error) {
            console.error('Error getting validation message:', error);
            return 'Validierungsfehler aufgetreten.';
        }
    });

    private subscriptions = new Subscription();
    private previousControl: AbstractControl | null = null;

    public ngOnChanges(): void {
        const currentControl = this.control();

        if (currentControl !== this.previousControl) {
            this.cleanupSubscriptions();

            if (currentControl) {
                try {
                    this.subscriptions.add(
                      currentControl.statusChanges.subscribe({
                          next: () => this.updateStatus(currentControl),
                          error: (error) => console.error('Status change subscription error:', error),
                      }),
                    );

                    this.subscriptions.add(
                      currentControl.valueChanges.subscribe({
                          next: () => this.updateStatus(currentControl),
                          error: (error) => console.error('Value change subscription error:', error),
                      }),
                    );

                    this.updateStatus(currentControl);
                } catch (error) {
                    console.error('Error setting up control subscriptions:', error);
                }
            }

            this.previousControl = currentControl;
        }
    }

    public ngOnDestroy(): void {
        this.cleanupSubscriptions();
    }

    public onBlur(): void {
        const control = this.control();
        if (control && typeof control.markAsTouched === 'function') {
            try {
                control.markAsTouched();
                this.updateStatus(control);
            } catch (error) {
                console.error('Error handling blur event:', error);
            }
        }
    }

    private updateStatus(control: AbstractControl): void {
        if (!control) {
            return;
        }

        try {
            this.controlStatus.set({
                invalid: Boolean(control.invalid),
                touched: Boolean(control.touched),
                dirty: Boolean(control.dirty),
                errors: control.errors,
            });
        } catch (error) {
            console.error('Error updating control status:', error);
        }
    }

    private cleanupSubscriptions(): void {
        try {
            this.subscriptions.unsubscribe();
            this.subscriptions = new Subscription();
        } catch (error) {
            console.error('Error cleaning up subscriptions:', error);
        }
    }
}