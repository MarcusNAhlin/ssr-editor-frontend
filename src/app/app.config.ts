import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { RefreshInterceptor } from './interceptors/refresh.interceptor';
import { routes } from './app.routes';
import { LucideAngularModule, FileText, Users, Plus, FileCode } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(LucideAngularModule.pick({ FileText, Users, Plus, FileCode })),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RefreshInterceptor, multi: true },
  ],
};

