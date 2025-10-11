import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Document } from '../../types/document';

import { ShareDocDialogComponent } from '../../components/share-doc-dialog/share-doc-dialog.component';
import { MonacoEditorComponent } from '../../components/monaco-editor/monaco-editor.component';
import { QuillEditorComponent } from '../../components/quill-editor/quill-editor.component';

@Component({
  selector: 'app-doc-edit',
  imports: [CommonModule, FormsModule, ShareDocDialogComponent, MonacoEditorComponent, QuillEditorComponent],
  templateUrl: './doc-edit.component.html',
  styleUrl: './doc-edit.component.scss'
})

export class DocEditComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  document?: Document;

  loading = true;
  saving = false;
  showShare = false;
  error?: string;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'No document ID provided';
      this.loading = false;
      return;
    }
    this.getDocument(id);
  }

  getDocument(id: string): void {
    this.api.getDocument(id).subscribe({
      next: (doc) => {
        this.document = doc;
        this.loading = false;
        console.log('Successfully loaded document:', this.document);
      },
      error: () => { this.error = 'Failed to load document.'; this.loading = false; }
    });
  }

  saveDocument() {
    this.loading = true;
    this.saving = true;
    this.error = '';

    if (!this.document?.title || !this.document.content) {
      this.loading = false;
      this.saving = false;
      this.error = 'Missing title or content';

      return;
    }

    this.api.editDocument({
      _id: this.document?._id,
      title: this.document?.title,
      content: this.document?.content,
      type: this.document?.type,
    }).subscribe({
      next: (data: Document) => {
        console.log('Successfully edited document:', data);

        this.loading = false;
        this.saving = false;
      },
      error: (err) => {
        this.error = 'Failed to edit document';
        this.loading = false;
        this.saving = false;

        console.error('Failed to edit document:', err);
      }
    });
  }

  deleteDocument() {
    this.loading = true;
    const documentIdentifier = (this.document?.title || this.document?._id);

    // Show browser confirm modal
    const confirmedDelete = confirm(`Are you sure you want to delete document "${documentIdentifier}"`);

    if (confirmedDelete) {
      if (!this.document?._id) {
        this.loading = false;
        this.error = 'Missing document id';

        console.error('Missing document id for document: ', this.document);
      }

      this.api.deleteDocument(this.document!._id).subscribe({
        next: (data: Document) => {
          console.log('Successfully deleted document:', data);

          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to delete document';
          this.loading = false;

          console.error('Failed to delete document:', err);
        }
      });

      alert(`Document "${documentIdentifier}" deleted successfully`);

      this.router.navigate(['/']);
    }
  }
}
