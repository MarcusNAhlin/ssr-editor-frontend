import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

import { User } from '../types/user';
import { LoginDto, LoginResponse, RegisterDto, RegisterResponse } from '../types/auth';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.API_URL.replace(/\/+$/, '');
  private authUrl = `${this.apiUrl}/auth`;
  private _user = signal<User | null>(this.restore<User>(USER_KEY));

  user = computed(() => this._user());
  isAuthed = computed(() => this._user() !== null);

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isExpired(token);
  }

  private http = inject(HttpClient);

  login(credentials: LoginDto) {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap(res => {
        this.setItem(TOKEN_KEY, res.token);
        if (res.refresh_token) this.setItem(REFRESH_KEY, res.refresh_token);
        const u: User = res.user ?? { email: credentials.email };

        this.setItem(USER_KEY, u);
        this._user.set(u);
      }),
      catchError(err => throwError(() => err))
    );
  }

  register(body: RegisterDto) {
    return this.http.post<RegisterResponse>(`${this.authUrl}/register`, body).pipe(
      tap(res => {
        if ('token' in res) {
          this.setItem(TOKEN_KEY, res.token);
          if (res.refresh_token) this.setItem(REFRESH_KEY, res.refresh_token);
          if (res.user) {
            this.setItem(USER_KEY, res.user);
            this._user.set(res.user);
          }
        }
      })
    );
  }

  logout(): void {
    this.removeItem(TOKEN_KEY);
    this.removeItem(REFRESH_KEY);
    this.removeItem(USER_KEY);
    this._user.set(null);
  }

  getToken(): string | null {
    return this.getItem<string>(TOKEN_KEY);
  }

  private isExpired(jwt: string): boolean {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1] || ''));
      if (!payload?.exp) return false;
      return Date.now() / 1000 >= payload.exp;
    } catch { return false; }
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

  private restore<T>(key: string): T | null { return this.getItem<T>(key); }
}
