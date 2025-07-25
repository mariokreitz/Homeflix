export interface UserInterface {
    id: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date;
    failedLoginAttempts: number;
}