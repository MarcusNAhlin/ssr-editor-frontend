import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges,
  ViewChild, ElementRef, HostListener, ChangeDetectionStrategy, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AppModalComponent } from '../app-modal/app-modal.component';
import { Router } from '@angular/router';
import { Document } from '../../types/document';

@Component({
  selector: 'app-create-doc-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, AppModalComponent],
  templateUrl: './create-doc-modal.component.html',
  styleUrls: ['./create-doc-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateDocModalComponent implements OnChanges {
  @Input() open = false;

  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<Pick<Document, '_id' | 'title' | 'type'>>();
  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() errorChange = new EventEmitter<string>();

  @ViewChild('titleInput') titleEl?: ElementRef<HTMLInputElement>;

  title = '';
  type: 'code' | 'richtext' = 'richtext';;
  pending = false;
  submitted = false;
  serverError = '';

  private api = inject(ApiService);
  private router = inject(Router);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open']?.currentValue === true) {
      this.title = '';
      this.type = 'richtext';
      this.pending = false;
      this.submitted = false;
      this.serverError = '';
      setTimeout(() => this.titleEl?.nativeElement?.focus(), 0);
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() { if (this.open) this.onCancel(); }

  onCancel() {
    this.closed.emit();
  }

  get canSubmit() {
    return !this.pending && !!this.title.trim() && !!this.type;
  }

  submitForm() {
    this.submitted = true;
    this.serverError = '';
    if (!this.canSubmit) return;

    this.pending = true;
    this.loadingChange.emit(true);

    this.api.addDocument({
      title: this.title,
      content: ' ',
      type: this.type
    }).subscribe({
      next: (data: Document) => {
        // this.created.emit(data);
        this.router.navigate([`/doc/${data._id}`]);
        this.loadingChange.emit(false);
        this.pending = false;
        this.title = '';
        this.type = 'richtext';
        this.submitted = false;
      },
      error: (err) => {
        this.errorChange.emit('Failed to add new document');
        this.loadingChange.emit(false);
        this.pending = false;
        this.serverError = err?.error?.errors?.detail || 'Failed to create document.';
        console.error('Failed to add document:', err);
      }
    });
  }
}
