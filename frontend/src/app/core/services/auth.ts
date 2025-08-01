import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../shared/models/api_response';
import { LoginResponse, LogoutResponse, RegisterResponse } from '../../shared/models/auth';
import { UserInterface } from '../../shared/models/user';
import { User } from './user';

@Injectable({
    providedIn: 'root',
})
export class Auth {
    private readonly _sessionId: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
    public readonly sessionId: Signal<string | undefined> = this._sessionId.asReadonly();
    private readonly _apiUrl: string = environment.apiUrl;
    private readonly http: HttpClient = inject(HttpClient);
    private readonly router: Router = inject(Router);
    private readonly userService: User = inject(User);

    public login(email: string, password: string, rememberMe: boolean = false): Observable<ApiSuccessResponse<LoginResponse, {}>> {
        return this.http.post<ApiSuccessResponse<LoginResponse, {}>>(`${this._apiUrl}/auth/login`, {
            email,
            password,
            rememberMe,
        }, {}).pipe(
          tap((response: ApiSuccessResponse<LoginResponse, {}>) => {
              if (response?.success && response.data?.sessionId) {
                  this._sessionId.set(response.data.sessionId);

                  if (response.data?.user) {
                      this.userService.setUser(response.data.user as UserInterface);
                  }

                  this.router.navigate([ '/dashboard' ]);
              }
          }),
        );
    }

    public logout(): Observable<ApiSuccessResponse<LogoutResponse, {}>> {
        return this.http.post<ApiSuccessResponse<LogoutResponse, {}>>(`${this._apiUrl}/auth/logout`, {}).pipe(
          tap(() => {
              this.userService.clearUser();
              this.router.navigate([ '/' ]);
          }),
        );
    }

    public register(email: string, password: string): Observable<ApiSuccessResponse<RegisterResponse, {}>> {
        return this.http.post<ApiSuccessResponse<RegisterResponse, {}>>(`${this._apiUrl}/auth/register`, {
            email,
            password,
        }, {});
    }
}