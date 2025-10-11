import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { Document } from '../../types/document';

@Component({
  selector: 'app-document-add-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './document-add-form.component.html',
  styleUrl: './document-add-form.component.scss'
})
export class DocumentAddFormComponent {
  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() errorChange = new EventEmitter<string>();

  private router = inject(Router);
  private api = inject(ApiService);
  title = '';

  onSubmit() {
    this.loadingChange.emit(true);
    this.errorChange.emit('');

    this.api.addDocument({
      title: this.title,
      content: ' ',
      type:'richtext'
    }).subscribe({
      next: (data: Document) => {
        console.log('Successfully added document:', data);

        this.router.navigate([`/doc/${data._id}`]);
        this.loadingChange.emit(false);
      },
      error: (err) => {
        this.errorChange.emit('Failed to add new document');
        this.loadingChange.emit(false);

        console.error('Failed to add document:', err);
      }
    });
  }
}
