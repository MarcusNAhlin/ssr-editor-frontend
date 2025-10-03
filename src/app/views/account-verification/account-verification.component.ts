import { Component, inject, OnInit,  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-account-verification',
  imports: [CommonModule,FormsModule],
  templateUrl: './account-verification.component.html',
  styleUrl: './account-verification.component.scss'
})
export class AccountVerificationComponent implements OnInit {
  private api = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);


  loading = true;
  error?: string;

  code = '';
  userId = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'No user ID provided';
      this.loading = false;
      return;
    }
    this.userId = id;
    this.loading = false;
  }

  submitVerificationCode() {
    this.error = undefined;

    const trimmedCodeInput = this.code.trim();
    console.log(trimmedCodeInput);
    if (trimmedCodeInput.length < 6) {
      this.error = 'Enter a 6 digit code!';
      return;
    }

    this.loading = true;

    const body = {
      verificationCode: trimmedCodeInput
    };

    console.log(body);

    this.api.verify(this.userId, body).pipe().subscribe({
      next: () => {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to verify your email';
      }
    }
    );
  }
}
