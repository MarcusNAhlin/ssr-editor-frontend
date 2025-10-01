import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-modal.component.html',
  styleUrls: ['./app-modal.component.scss']
})
export class AppModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() closeOnBackdrop = true;
  @Output() closeModal = new EventEmitter<void>();

  titleId = `modal-title-${Math.random().toString(36).slice(2)}`;

  @HostListener('document:keydown.escape')
  onEsc() { if (this.open) this.closeModal.emit(); }
}
