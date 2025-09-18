import { Routes } from '@angular/router';
import { OverviewComponent } from './views/overview/overview.component';
import { DocEditComponent } from './views/doc-edit/doc-edit.component';

export const routes: Routes = [
  { path: '', redirectTo: '/overview', pathMatch: 'full' },
  { path: 'overview', component: OverviewComponent },
  { path: 'doc/:id', component: DocEditComponent }
];
