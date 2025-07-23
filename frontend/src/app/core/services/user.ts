import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { UserInterface } from '../../shared/models/user';

@Injectable({
    providedIn: 'root',
})
export class User {
    private readonly _user: WritableSignal<UserInterface | null | undefined> = signal<UserInterface | null | undefined>(undefined);
    public readonly user: Signal<UserInterface | null | undefined> = this._user.asReadonly();

    public setUser(user: UserInterface): void {
        this._user.set(user);
    }
}
