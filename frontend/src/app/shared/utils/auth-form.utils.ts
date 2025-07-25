import { inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formValidationConfig } from '../config/form-config';
import { AuthFormConfig } from '../models/form';
import { emailValidator, maxLengthValidator, minLengthValidator, passwordMatchValidator } from './form.utils';

export function useAuthForm(config: AuthFormConfig = {}): FormGroup {
    const fb = inject(FormBuilder);

    if (!fb) {
        throw new Error('FormBuilder injection failed');
    }

    const passwordMinLength = formValidationConfig.password.minLength.value;

    if (passwordMinLength < 1) {
        throw new Error('Invalid password minimum length configuration');
    }

    const formConfig: Record<string, [ string, readonly any[] ]> = {};

    if (config.includeEmail !== false) {
        formConfig['email'] = [
            '',
            [
                Validators.required,
                emailValidator,
            ] as const,
        ];
    }

    formConfig['password'] = [
        '',
        [
            Validators.required,
            minLengthValidator('password'),
            maxLengthValidator('password'),
        ] as const,
    ];

    if (config.includeConfirmPassword) {
        formConfig['confirmPassword'] = [
            '',
            [
                Validators.required,
            ] as const,
        ];
    }

    const form = fb.group(formConfig);

    if (config.includeConfirmPassword) {
        form.addValidators(passwordMatchValidator);
    }

    if (!form) {
        throw new Error('Form creation failed');
    }

    return form;
}

