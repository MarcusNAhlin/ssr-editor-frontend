import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { RefreshResponse } from '../types/auth';
import { Router } from '@angular/router';

const EXPIRED_TOKEN_MSG = 'Token expired';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private router = inject(Router);
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(error => {
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401 &&
          error.error.errors.detail === EXPIRED_TOKEN_MSG
        ) {
          return this.handleExpiredTokenError(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handleExpiredTokenError(request: HttpRequest<unknown>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((res: RefreshResponse) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(res.accessToken);
          return next.handle(this.addTokenHeader(request, res.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logout();
          if (err instanceof HttpErrorResponse && [400, 401].includes(err.status)) {
            this.router.navigate(['/login']);
          }
          return throwError(() => err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addTokenHeader(request, token as string)))
    );
  }

  private addTokenHeader(request: HttpRequest<unknown>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

