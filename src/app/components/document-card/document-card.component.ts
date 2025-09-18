import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Document {
  _id?: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-document-card',
  imports: [RouterLink, CommonModule],
  templateUrl: './document-card.component.html',
  styleUrl: './document-card.component.scss'
})
export class DocumentCardComponent {
  @Input() document: Document | undefined = undefined;
}
