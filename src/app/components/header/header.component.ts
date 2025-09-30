import { Component, inject, computed } from '@angular/core';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  isAuthed = computed(() => this.auth.isAuthed());
  email = computed(() => this.auth.user()?.email ?? '');

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
