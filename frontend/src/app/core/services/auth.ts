import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../shared/models/api_response';
import { CsrfTokenMetaResponse, CsrfTokenResponse, LoginResponse, SessionResponse } from '../../shared/models/auth';
import { UserInterface } from '../../shared/models/user';
import { User } from './user';

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

    private readonly _apiUrl: string = environment.apiUrl;
    private readonly http: HttpClient = inject(HttpClient);
    private readonly router: Router = inject(Router);
    private readonly userService: User = inject(User);

    public login(email: string, password: string): Observable<ApiSuccessResponse<LoginResponse, {}>> {
        return this.http.post<ApiSuccessResponse<LoginResponse, {}>>(`${this._apiUrl}/auth/login`, {
            email,
            password,
        }, {}).pipe(
          tap((response: ApiSuccessResponse<LoginResponse, {}>) => {
              if (response?.success && response.data?.csrfToken && response.data?.sessionId) {
                  this._isAuthenticated.set(true);
                  this._csrfToken.set(response.data.csrfToken);
                  this._sessionId.set(response.data.sessionId);

                  if (response.data?.user) {
                      this.userService.setUser(response.data.user as UserInterface);
                  }

                  this.router.navigate([ '/dashboard' ]);
              } else {
                  this._isAuthenticated.set(false);
                  this._csrfToken.set(null);
                  this._sessionId.set(null);
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
              this.userService.clearUser();
              this.router.navigate([ '/' ]);
          }),
        );
    }

    public refreshCsrfToken(refreshToken: string): Observable<ApiSuccessResponse<{ csrfToken: string }, {}>> {
        return this.http.post<ApiSuccessResponse<{ csrfToken: string }, {}>>(`${this._apiUrl}/auth/refresh`, { refreshToken }, {}).pipe(
          tap((response: ApiSuccessResponse<{ csrfToken: string }, {}>) => {
              if (response?.success && response.data?.csrfToken) {
                  this._csrfToken.set(response.data.csrfToken);
              }
          }),
        );
    }

    public initialize(): Observable<boolean> {
        return this.checkAuthStatus().pipe(
          tap((isAuthenticated) => {
              if (isAuthenticated) {
                  const currentUrl = this.router.url;
                  const publicRoutes = [
                      '/',
                      '/login',
                      '/register',
                  ];

                  if (publicRoutes.includes(currentUrl)) {
                      this.router.navigate([ '/dashboard' ]);
                  }
              }
          }),
        );
    }

    private checkAuthStatus(): Observable<boolean> {
        return this.http.get<ApiSuccessResponse<SessionResponse, {}>>(`${this._apiUrl}/auth/verify-session`, {}).pipe(
          tap((response: ApiSuccessResponse<SessionResponse, {}>) => {
              if (response?.success) {
                  this._isAuthenticated.set(true);

                  if (response.data?.sessionId) {
                      this._sessionId.set(response.data.sessionId);
                  }

                  if (response.data?.user) {
                      this.userService.setUser(response.data.user as UserInterface);
                  }
              } else {
                  this._isAuthenticated.set(false);
                  this._sessionId.set(null);
                  this._csrfToken.set(null);
                  this.userService.clearUser();
              }
          }),
          switchMap((response: ApiSuccessResponse<SessionResponse, {}>) => {
              // Wenn Authentifizierung erfolgreich, hole den CSRF-Token
              if (response?.success) {
                  return this.getCsrfTokenForSession().pipe(
                    // Das Ergebnis des CSRF-Abrufs ignorieren, aber den Auth-Status zurückgeben
                    switchMap(() => of(true)),
                  );
              }
              // Wenn nicht authentifiziert, gebe direkt false zurück
              return of(false);
          }),
          catchError(() => {
              this._isAuthenticated.set(false);
              this._sessionId.set(null);
              this._csrfToken.set(null);
              this.userService.clearUser();
              return of(false);
          }),
        );
    }

    private getCsrfTokenForSession(): Observable<ApiSuccessResponse<CsrfTokenResponse, CsrfTokenMetaResponse>> {
        return this.http.get<ApiSuccessResponse<CsrfTokenResponse, CsrfTokenMetaResponse>>(`${this._apiUrl}/auth/csrf`, {}).pipe(
          tap((response: ApiSuccessResponse<CsrfTokenResponse, CsrfTokenMetaResponse>) => {
              if (response?.success && response.data?.csrfToken) {
                  this._csrfToken.set(response.data.csrfToken);

                  // Aktualisiere die Session-ID, falls vorhanden
                  if (response.meta?.sessionId) {
                      this._sessionId.set(response.meta.sessionId);
                  }
              } else {
                  this._csrfToken.set(null);
              }
          }),
          catchError(() => {
              this._csrfToken.set(null);
              return of({
                  success: false,
                  data: { csrfToken: '' },
                  meta: { sessionId: '' },
              } as ApiSuccessResponse<CsrfTokenResponse, CsrfTokenMetaResponse>);
          }),
        );
    }
}