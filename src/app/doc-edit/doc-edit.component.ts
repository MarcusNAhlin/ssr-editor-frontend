import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Document {
  _id?: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-doc-edit',
  imports: [CommonModule, FormsModule],
  templateUrl: './doc-edit.component.html',
  styleUrl: './doc-edit.component.scss'
})

export class DocEditComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  document?: Document;
  loading = true;
  // saving = false;
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
      next: (doc) => { this.document = doc; this.loading = false; },
      error: () => { this.error = 'Failed to load document.'; this.loading = false; }
    });
  }

  save(): void{
    // Code for saving doc
  }

}
