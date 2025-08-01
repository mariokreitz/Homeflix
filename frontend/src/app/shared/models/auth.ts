import { UserInterface } from './user';

export interface RegisterResponse {
    user: UserInterface;
}

export interface LoginResponse {
    sessionId: string;
    user: Pick<UserInterface, 'id' | 'email'>;
}

export interface SessionResponse {
    sessionId: string;
    user: Pick<UserInterface, 'id'>;
}

export interface LogoutResponse {
    message: string;
}

export interface CsrfTokenResponse {
    csrfToken: string;
}

export interface CsrfTokenMetaResponse {
    sessionId: string;
}

export interface ErrorResponse {
    readonly error: string,
    readonly method: string,
    readonly path: string,
    readonly timestamp: string
}
