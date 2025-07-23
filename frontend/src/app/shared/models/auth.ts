import { UserInterface } from './user';

export interface LoginResponse {
    csrfToken: string;
    sessionId: string;
    user: Pick<UserInterface, 'id' | 'email'>;
}

export interface ErrorResponse<DetailsType extends Object> {
    success: boolean;
    error: Error<DetailsType>;
}

interface Error<DetailsType extends Object = {}> {
    code: string;
    message: string;
    details: DetailsType;
}