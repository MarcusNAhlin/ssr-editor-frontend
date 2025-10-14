import * as Y from 'yjs';
import * as monaco from 'monaco-editor';
import { NuMonacoEditorComponent, NuMonacoEditorEvent } from '@ng-util/monaco-editor';
import { Component, computed, inject, Input, OnDestroy } from '@angular/core';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-monaco-editor',
  imports: [CommonModule, FormsModule, NuMonacoEditorComponent],
  templateUrl: './monaco-editor.component.html',
  styleUrl: './monaco-editor.component.scss',
  standalone: true
})
export class MonacoEditorComponent implements OnDestroy {
  @Input({ required: true }) docId!: string;
  @Input() value = '';

  public editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    automaticLayout: true,
    value: '',
    readonly: true,
  };

  private auth = inject(AuthService);

  private editor?: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor;
  private yDoc = new Y.Doc();
  private provider?: WebsocketProvider;
  private binding?: MonacoBinding;
  readonly userEmail = computed(() => this.auth.user()?.email ?? 'Anon');

  onEditorEvent(event: NuMonacoEditorEvent): void {
    if (event.type === 'init' && event.editor) {
      this.editor = event.editor as unknown as typeof this.editor;

      try {
        // test if this.editor is of type IStandaloneCodeEditor
        // y-monaco doesn't support IStandaloneDiffEditor
        //
        (this.editor as monaco.editor.IStandaloneCodeEditor).getModel();
      } catch {
        console.warn('IStandaloneDiffEditor is not supported by y-monaco');
        return;
      }

      this.editor = this.editor as monaco.editor.IStandaloneCodeEditor;
      // disable input when data not loaded yet
      this.editor.updateOptions({ readOnly: true });

      this.provider = new WebsocketProvider(
        environment.API_WS_URL,
        this.docId,
        this.yDoc
      );

      const yText = this.yDoc.getText('monaco-content');

      // this.provider.awareness.setLocalStateField('user', {
      //   name: this.userEmail(),
      //   color: '#d9ff00ff'
      // });

      this.binding = new MonacoBinding(
        yText,
        this.editor.getModel()!,
        new Set([this.editor]),
        this.provider.awareness,
      );

      this.editor.updateOptions({ readOnly: false });
    }
  }

  getValue(): string {
    // Get value of editor content
    return this.yDoc.getText('monaco-content').toString();
  }

  ngOnDestroy(): void {
    if (this.binding) {
      this.binding.destroy();
      this.binding = undefined;
    }
    if (this.provider) {
      this.provider.destroy();
      this.provider = undefined;
    }
    if (this.yDoc) {
      this.yDoc.destroy();
    }
  }
}