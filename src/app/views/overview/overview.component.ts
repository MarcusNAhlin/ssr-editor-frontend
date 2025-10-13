import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentCardComponent } from '../../components/document-card/document-card.component';
import { ApiService } from '../../services/api.service';
import { Document } from '../../types/document';
import { Router } from '@angular/router';
import { CreateDocModalComponent } from '../../components/create-doc-modal/create-doc-modal.component';
import { LucideAngularModule } from 'lucide-angular';


@Component({
  selector: 'app-overview',
  imports: [CommonModule, FormsModule, DocumentCardComponent, CreateDocModalComponent, LucideAngularModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  documents: Document[] = [];
  addedDocument: Document | undefined = undefined;
  showCreate = false;
  title = '';
  loading = false;
  error?: string;

  ngOnInit(): void {
    this.getDocuments();
  }

  onLoadingChange(loading: boolean) {
    this.loading = loading;
  }

  onErrorChange(error: string) {
    this.error = error;
  }

  getDocuments(): void {
    this.loading = true;
    this.api.getDocuments().subscribe({
      next: (data: Document[]) => {
        this.documents = data;
        this.loading = false;

        console.log('Successfully fetched all documents:', data);
      },
      error: (err) => {
        this.error = 'Failed to fetch documents';
        this.loading = false;

        console.error('Failed to fetch documents:', err);
      }
    });
  }
  onCreated(doc: { _id: string; type: 'richtext'|'code'; title: string; language?: string }) {
    this.showCreate = false;
    this.router.navigate(['/doc', doc._id]);
  }
}
