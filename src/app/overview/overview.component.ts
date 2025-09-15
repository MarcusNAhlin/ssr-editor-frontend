import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Document {
  _id: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-overview',
  imports: [CommonModule, RouterLink],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
  private api = inject(ApiService);
  documents: Document[] = [];

  ngOnInit(): void {
    this.getDocuments();
  }

  getDocuments(): void {
    this.api.getDocuments().subscribe((data: Document[]) => {
      this.documents = data;
      console.log('Data:', data);
    });
  }
}
