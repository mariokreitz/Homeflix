import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../shared/models/api_response';
import { LoginResponse } from '../../shared/models/auth';

@Injectable({
    providedIn: 'root',
})
export class Auth {
    private readonly _isAuthenticated: WritableSignal<boolean> = signal<boolean>(false);
    public readonly isAuthenticated: Signal<boolean> = this._isAuthenticated.asReadonly();

    private readonly _apiUrl: string = environment.apiUrl;
    private readonly http: HttpClient = inject(HttpClient);

    public login(email: string, password: string): Observable<ApiSuccessResponse<LoginResponse, {}>> {
        return this.http.post<ApiSuccessResponse<LoginResponse, {}>>(`${this._apiUrl}/auth/login`, {
            email,
            password,
        }, {}).pipe(
          tap((response: ApiSuccessResponse<LoginResponse, {}>) => {
              if (response.success) {
                  this._isAuthenticated.set(true);
              }
          }),
        );
    }
}
