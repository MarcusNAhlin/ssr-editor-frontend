import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges,
  ViewChild, ElementRef, HostListener, ChangeDetectionStrategy,inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AppModalComponent } from '../app-modal/app-modal.component';

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
  @Input() docId: string | null = null;
  @Input() docName = '';

  @Output() closed = new EventEmitter<void>();
  @Output() success = new EventEmitter<{ email: string }>();

  @ViewChild('emailInput') emailEl?: ElementRef<HTMLInputElement>;

  email = '';
  pending = false;
  submitted = false;
  serverError = '';
  private api = inject(ApiService);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open']?.currentValue === true) {
      this.email = '';
      this.pending = false;
      this.submitted = false;
      this.serverError = '';
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
    if (!this.isValidEmail(this.email) || !this.docId) return;

    this.pending = true;
    this.api.shareDocument(this.docId, { shareToEmail: this.email }).subscribe({
      next: () => {
        this.pending = false;
        this.success.emit({ email: this.email.trim() });
        this.onCancel();
      },
      error: (err) => {
        this.pending = false;
        this.serverError = err?.error?.message || 'Failed to share document';
      }
    });
  }
}
