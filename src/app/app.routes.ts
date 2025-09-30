import { Routes } from '@angular/router';
import { OverviewComponent } from './views/overview/overview.component';
import { DocEditComponent } from './views/doc-edit/doc-edit.component';
import { LoginComponent } from './views/login/login.component';
import { RegisterComponent } from './views/register/register.component';
import { authGuard } from './auth/auth.guard';
import { guestGuard } from './auth/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'login', canMatch: [guestGuard], component: LoginComponent },
  { path: 'register', canMatch: [guestGuard], component: RegisterComponent },
  { path: 'overview', canMatch: [authGuard], component: OverviewComponent },
  { path: 'doc/:id', canMatch: [authGuard], component: DocEditComponent },
  { path: '**', redirectTo: 'overview' }
];