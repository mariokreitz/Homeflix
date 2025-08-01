import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { UserInterface } from '../../shared/models/user';

@Injectable({
    providedIn: 'root',
})
export class User {
    private readonly _user: WritableSignal<UserInterface | null> = signal<UserInterface | null>(null);
    public readonly user: Signal<UserInterface | null> = this._user.asReadonly();

    public setUser(user: UserInterface): void {
        this._user.set(user);
    }

    public clearUser(): void {
        this._user.set(null);
    }

    public isLoggedIn(): boolean {
        return !!this._user();
    }
}
