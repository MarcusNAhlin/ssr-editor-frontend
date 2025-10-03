import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

import { User } from '../types/user';
import { LoginDTO, LoginResponse, RegisterDTO, RegisterResponse, RefreshResponse } from '../types/auth';

const TOKEN_KEY = 'access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.API_URL.replace(/\/+$/, '');
  private authUrl = `${this.apiUrl}/auth`;
  private _user = signal<User | null>(null);

  user = computed(() => this._user());
  isAuthed = computed(() => this._user() !== null);

  private http = inject(HttpClient);

  constructor() {
    const token = this.getToken();
    if (token) {
      this._user.set(this.decodeToken(token));
    }
  }

  isAuthenticated() {
    return this.getItem(TOKEN_KEY);
  }

  login(credentials: LoginDTO) {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap(res => {
        this.setItem(TOKEN_KEY, res.accessToken);
        this._user.set(this.decodeToken(res.accessToken));
      }),
      catchError(err => throwError(() => err))
    );
  }

  refreshToken() {
    return this.http.post<RefreshResponse>(`${this.authUrl}/refresh`, {}, { withCredentials: true }).pipe(
      tap(res => {
        this.setItem(TOKEN_KEY, res.accessToken);
      })
    );
  }

  register(body: RegisterDTO) {
    return this.http.post<RegisterResponse>(`${this.authUrl}/register`, body).pipe(
      tap(res => {
        if ('accessToken' in res) {
          this.setItem(TOKEN_KEY, res.accessToken);
          this._user.set(this.decodeToken(res.accessToken as string));
        }
      })
    );
  }

  verify(userId: string, body: unknown){
    return this.http.post<unknown>(`${this.authUrl}/verify/${userId}`, body);
  }

  logout(): void {
    this.removeItem(TOKEN_KEY);
    this._user.set(null);
    this.http.post(`${this.authUrl}/logout`, {}).subscribe();
  }

  getToken(): string | null {
    return this.getItem<string>(TOKEN_KEY);
  }

  private getItem<T = string>(key: string): T | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return raw as unknown as T; }
  }

  private setItem(key: string, value: unknown) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  }

  private removeItem(key: string) {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  }

  private decodeToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      if (payload) {
        return payload as User;
      }
      return null;
    } catch {
      return null;
    }
  }
}
