import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.form.value as { email: string; password: string })
      .subscribe({
        next: () => {
          this.loading.set(false);
          const raw = new URLSearchParams(location.search).get('returnUrl');
          const target = raw ? decodeURIComponent(raw) : '/overview';
          this.router.navigateByUrl(target, { replaceUrl: true });
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.message ?? 'Login failed. Check your credentials.');
        }
      });
  }
}
