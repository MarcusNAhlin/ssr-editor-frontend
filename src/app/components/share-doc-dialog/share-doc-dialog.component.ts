import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges,
  ViewChild, ElementRef, HostListener, ChangeDetectionStrategy,inject, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AppModalComponent } from '../app-modal/app-modal.component';
import { Document } from '../../types/document';
import { User } from '../../types/user';

@Component({
  selector: 'app-share-doc-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule,AppModalComponent],
  templateUrl: './share-doc-dialog.component.html',
  styleUrls: ['./share-doc-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareDocDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() doc: Document | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() success = new EventEmitter<{ email: string }>();

  @ViewChild('emailInput') emailEl?: ElementRef<HTMLInputElement>;

  email = '';
  pending = false;
  submitted = false;
  serverError = '';

  currentShared: User[] = [];

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open']?.currentValue === true) {
      this.email = '';
      this.pending = false;
      this.submitted = false;
      this.serverError = '';
      console.log(this.doc);

      this.currentShared = Array.isArray(this.doc?.sharedWith) ? [...this.doc!.sharedWith] : [];
      setTimeout(() => this.emailEl?.nativeElement?.focus(), 0);
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() { if (this.open) this.onCancel(); }

  onCancel() {
    this.closed.emit();
  }

  isValidEmail(val: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((val || '').trim());
  }

  submitForm() {
    this.submitted = true;
    this.serverError = '';

    if (!this.isValidEmail(this.email) || !this.doc?._id) return;

    if (this.currentShared.some(u => u.email.toLowerCase() === this.email.toLowerCase())) {
      this.serverError = 'That email already has access.';
      this.cdr.markForCheck();
      return;
    }

    this.pending = true;
  
    this.api.shareDocument(this.doc._id, { shareToEmail: this.email }).pipe (
      finalize(() => {
        this.pending = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.currentShared = [...this.currentShared, { email: this.email }];
        this.success.emit({ email: this.email });
        this.email = '';
        this.submitted = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.pending = false;
        this.serverError = err?.error?.message || 'Failed to share document with ' + this.email;
      }
    });
  }
}
