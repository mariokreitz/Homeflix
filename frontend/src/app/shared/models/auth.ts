import { UserInterface } from './user';

export interface RegisterResponse {
    user: UserInterface;
}

export interface LoginResponse {
    csrfToken: string;
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

export interface ErrorResponse<DetailsType extends Object = {}> {
    success: boolean;
    error: Error<DetailsType>;
}

interface Error<DetailsType extends Object> {
    code: string;
    message: string;
    details: DetailsType;
}