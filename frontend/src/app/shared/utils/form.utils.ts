import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { formValidationConfig } from '../config/form-config';
import { ValidationRule } from '../models/form';

export const emailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (typeof value !== 'string') {
        return { email: { message: 'E-Mail muss ein Text sein' } };
    }

    const emailConfig = formValidationConfig.email;
    if (!validateConfigValue(value, emailConfig, (val, pattern) =>
      typeof val === 'string' && pattern.test(val),
    )) {
        return { email: { message: emailConfig.errorMessage } };
    }

    return null;
};

export const minLengthValidator = (fieldType: 'password'): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
          return null;
      }

      if (typeof value !== 'string') {
          return { minLength: { message: 'Wert muss ein Text sein' } };
      }

      const config = formValidationConfig[fieldType]?.minLength;
      if (!config) {
          throw new Error(`Invalid configuration for ${fieldType} minLength`);
      }

      if (value.length < config.value) {
          return {
              minLength: {
                  requiredLength: config.value,
                  actualLength: value.length,
                  message: formatErrorMessage(config.errorMessage, { value: config.value }),
              },
          };
      }

      return null;
  };

export const maxLengthValidator = (fieldType: 'password'): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
          return null;
      }

      if (typeof value !== 'string') {
          return { maxLength: { message: 'Wert muss ein Text sein' } };
      }

      const config = formValidationConfig[fieldType]?.maxLength;
      if (!config) {
          throw new Error(`Invalid configuration for ${fieldType} maxLength`);
      }

      if (value.length > config.value) {
          return {
              maxLength: {
                  requiredLength: config.value,
                  actualLength: value.length,
                  message: formatErrorMessage(config.errorMessage, { value: config.value }),
              },
          };
      }

      return null;
  };

export const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    if (!group) {
        return null;
    }

    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
        return null;
    }

    if (password !== confirmPassword) {
        const confirmControl = group.get('confirmPassword');
        if (confirmControl) {
            confirmControl.setErrors({ passwordMismatch: true });
        }
        return { passwordMismatch: { message: formValidationConfig.password.match.errorMessage } };
    }

    const confirmControl = group.get('confirmPassword');
    if (confirmControl?.hasError('passwordMismatch')) {
        const errors = { ...confirmControl.errors };
        delete errors['passwordMismatch'];
        confirmControl.setErrors(Object.keys(errors).length ? errors : null);
    }

    return null;
};

export function getValidationErrorMessage(
  errorType: string,
  errorDetails?: Record<string, unknown>,
): string {
    if (!errorType.trim()) {
        return 'Unbekannter Validierungsfehler.';
    }

    if (errorDetails?.['message'] && typeof errorDetails['message'] === 'string') {
        return errorDetails['message'];
    }

    switch (errorType.toLowerCase()) {
        case 'required':
            return 'Dieses Feld ist erforderlich.';
        case 'email':
            return formValidationConfig.email.errorMessage;
        case 'minlength':
            return formatErrorMessage(
              formValidationConfig.password.minLength.errorMessage,
              { value: formValidationConfig.password.minLength.value },
            );
        case 'maxlength':
            return formatErrorMessage(
              formValidationConfig.password.maxLength.errorMessage,
              { value: formValidationConfig.password.maxLength.value },
            );
        case 'passwordmismatch':
            return formValidationConfig.password.match.errorMessage;
        default:
            return 'Ungültige Eingabe.';
    }
}

export function formatErrorMessage(
  message: string,
  values: Record<string, unknown>,
): string {

    return message.replace(/\{(\w+)\}/g, (match, key) => {
        const value = values[key];
        return value !== undefined && value !== null ? String(value) : match;
    });
}

export function validateConfigValue<T>(
  value: unknown,
  rule: ValidationRule<T>,
  validator: (val: unknown, ruleValue: T) => boolean,
): boolean {
    if (!rule || typeof rule.value === 'undefined') {
        return false;
    }

    return validator(value, rule.value);
}
