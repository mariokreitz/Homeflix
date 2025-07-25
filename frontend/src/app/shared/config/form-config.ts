import { FormValidationConfig } from '../models/form';

export const formValidationConfig: FormValidationConfig = {
    password: {
        minLength: {
            value: 8,
            errorMessage: 'Das Passwort muss mindestens {value} Zeichen lang sein.',
        },
        maxLength: {
            value: 128,
            errorMessage: 'Das Passwort darf höchstens {value} Zeichen lang sein.',
        },
        match: {
            value: true,
            errorMessage: 'Die Passwörter stimmen nicht überein.',
        },
        requireSpecialChar: {
            value: false,
            errorMessage: 'Das Passwort muss mindestens ein Sonderzeichen enthalten.',
        },
    },
    email: {
        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        errorMessage: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    },
} as const;

