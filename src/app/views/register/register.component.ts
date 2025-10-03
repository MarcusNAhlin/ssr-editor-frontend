import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);

    this.auth.register(this.form.value as { email: string; password: string })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.router.navigateByUrl(`/verify/${res._id}`);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.message ?? 'Register failed. Check your credentials.');
        }
      });
  }
}
