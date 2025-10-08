import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Input, inject, computed } from '@angular/core';
import type * as monaco from 'monaco-editor';

// 👇 NEW
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-monaco-editor',
  standalone: true,
  templateUrl: './monaco-editor.component.html',
  styleUrl: './monaco-editor.component.scss'
})
export class MonacoEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;
  @Input() value = '';
  @Input() language = 'javascript';
  @Input({ required: true }) docId!: string;

  private auth = inject(AuthService);

  private monaco!: typeof monaco;
  private editor!: monaco.editor.IStandaloneCodeEditor;
  private model!: monaco.editor.ITextModel;
  private ydoc!: Y.Doc;
  private provider!: WebsocketProvider;
  private yText!: Y.Text;
  private binding!: MonacoBinding;
  readonly userEmail = computed(() => this.auth.user()?.email ?? 'Anon');

  private readonly WS_URL = 'ws://localhost:3000';

  async ngAfterViewInit() {
    // (self).MonacoEnvironment = {
    //   getWorkerUrl: () =>
    //     'data:text/javascript;charset=utf-8,' +
    //     encodeURIComponent(`
    //       self.MonacoEnvironment = { baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.54.0/min/' };
    //       importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.54.0/min/vs/base/worker/workerMain.js');
    //     `)
    // };
    this.monaco = await import('monaco-editor');

    this.model = this.monaco.editor.createModel(this.value ?? '', this.language);
    this.editor = this.monaco.editor.create(this.host.nativeElement, {
      model: this.model,
      automaticLayout: true,
      readOnly: true,
      theme: 'vs-dark',
    });

    this.ydoc = new Y.Doc();
    this.provider = new WebsocketProvider(this.WS_URL, this.docId, this.ydoc);

    this.provider.awareness.setLocalStateField('user', {
      name: this.userEmail(),
      color: '#fbff00ff'
    });

    this.yText = this.ydoc.getText('code');

    this.binding = new MonacoBinding(
      this.yText,
      this.model,
      new Set([this.editor]),
      this.provider.awareness
    );

    this.provider.on('sync', (isSynced: boolean) => {
      if (isSynced) this.editor.updateOptions({ readOnly: false });
    });
  }

  ngOnDestroy() {
    (this.binding)?.destroy?.();
    this.provider?.destroy();
    this.ydoc?.destroy();
    this.editor?.dispose();
    this.model?.dispose();
  }
}
