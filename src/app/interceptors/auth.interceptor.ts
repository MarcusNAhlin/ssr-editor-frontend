import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

const TOKEN_KEY = 'access_token';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    if (req.url.endsWith('/refresh')) {
      return next.handle(req.clone({ withCredentials: true }));
    }

    // If request has header 'X-Skip-Auth', don't add Authorization header
    if (req.headers.has('X-Skip-Auth')) {
      return next.handle(req);
    }

    const accessToken = localStorage.getItem(TOKEN_KEY);
    let authReq = req.clone({
      withCredentials: true
    });
    if (accessToken) {
      authReq = authReq.clone({
        setHeaders: { Authorization: `Bearer ${accessToken}` }
      });
    }
    return next.handle(authReq);
  }
}
