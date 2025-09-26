import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Document } from '../../types/document';

@Component({
  selector: 'app-document-card',
  imports: [RouterLink, CommonModule],
  templateUrl: './document-card.component.html',
  styleUrl: './document-card.component.scss'
})
export class DocumentCardComponent {
  @Input() document: Document | undefined = undefined;
}
