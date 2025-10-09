import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NuMonacoEditorComponent } from '@ng-util/monaco-editor';

@Component({
  selector: 'app-monaco-editor',
  imports: [CommonModule, FormsModule, NuMonacoEditorComponent],
  templateUrl: './monaco-editor.component.html',
  styleUrl: './monaco-editor.component.scss',
  standalone: true
})
export class MonacoEditorComponent {
  @Input({ required: true }) docId!: string;
  @Input() value = '';

  editorOptions = { theme: 'vs-dark', language: 'typescript' };
}
