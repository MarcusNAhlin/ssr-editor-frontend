import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Document {
  _id?: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-overview',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
  private router = inject(Router);
  private api = inject(ApiService);

  documents: Document[] = [];
  addedDocument: Document | undefined = undefined;

  title = '';
  loading = false;
  error?: string;

  ngOnInit(): void {
    this.loading = true;
    this.getDocuments();
    this.loading = false;
  }

  onSubmit() {
    this.loading = true;
    this.error = '';

    this.api.addDocument({
      title: this.title,
      content: ' ',
    }).subscribe({
      next: (data: Document) => {
        this.addedDocument = data;
        this.documents.push(data);

        console.log('Successfully added document:', data);

        this.router.navigate([`/doc/${data._id}`]);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to add new document';
        this.loading = false;

        console.error('Failed to add document:', err);
      }
    });
  }

  getDocuments(): void {
    this.api.getDocuments().subscribe((data: Document[]) => {
      this.documents = data;

      console.log('Successfully fetched all documents:', data);
    });
  }
}
