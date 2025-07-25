export interface ValidationRule<T = unknown> {
    readonly value: T;
    readonly errorMessage: string;
}

export interface FormValidationConfig {
    readonly password: {
        readonly minLength: ValidationRule<number>;
        readonly maxLength: ValidationRule<number>;
        readonly match: ValidationRule<boolean>;
        readonly requireSpecialChar: ValidationRule<boolean>;
    };
    readonly email: ValidationRule<RegExp>;
}

export interface AuthFormConfig {
    readonly includeUsername?: boolean;
    readonly includeEmail?: boolean;
    readonly includeConfirmPassword?: boolean;
}