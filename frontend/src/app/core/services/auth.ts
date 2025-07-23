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

    private readonly _csrfToken: WritableSignal<string | null> = signal<string | null>(null);
    public readonly csrfToken: Signal<string | null> = this._csrfToken.asReadonly();

    private readonly _sessionId: WritableSignal<string | null> = signal<string | null>(null);
    public readonly sessionId: Signal<string | null> = this._sessionId.asReadonly();

    private readonly _accessToken: WritableSignal<string | null> = signal<string | null>(null);
    public readonly accessToken: Signal<string | null> = this._accessToken.asReadonly();

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
                  this._csrfToken.set(response.data.csrfToken);
                  this._sessionId.set(response.data.sessionId);
              }
          }),
        );
    }

    public logout(): Observable<ApiSuccessResponse<{ message: string }, {}>> {
        return this.http.post<ApiSuccessResponse<{ message: string }, {}>>(`${this._apiUrl}/auth/logout`, {}).pipe(
          tap(() => {
              this._isAuthenticated.set(false);
              this._csrfToken.set(null);
              this._sessionId.set(null);
              this._accessToken.set(null);
          }),
        );
    }

    public refreshCsrfToken(refreshToken: string): Observable<ApiSuccessResponse<{ csrfToken: string }, {}>> {
        return this.http.post<ApiSuccessResponse<{ csrfToken: string }, {}>>(`${this._apiUrl}/auth/refresh`, { refreshToken }, {}).pipe(
          tap((response: ApiSuccessResponse<{ csrfToken: string }, {}>) => {
              if (response.success) {
                  this._csrfToken.set(response.data.csrfToken);
              }
          }),
        );
    }
}