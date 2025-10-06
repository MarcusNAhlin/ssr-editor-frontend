import { Component, AfterViewInit, ElementRef, OnDestroy, ViewChild, Input, inject, computed } from '@angular/core';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import * as Y from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import { QuillBinding } from 'y-quill';
import { AuthService } from '../../services/auth.service';

Quill.register('modules/cursors', QuillCursors);

@Component({
  selector: 'app-quill-editor',
  standalone: true,
  templateUrl: './quill-editor.component.html',
  styleUrl: './quill-editor.component.scss'
})
export class QuillEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;
  @Input ({ required: true }) docId!: string;

  private auth = inject(AuthService);

  private quill!: Quill;
  private ydoc!: Y.Doc;
  private provider!: SocketIOProvider;
  private yText!: Y.Text;
  private binding!: QuillBinding;
  readonly userEmail = computed(() => this.auth.user()?.email ?? 'Annon');

  ngAfterViewInit() {
    this.quill = new Quill(this.host.nativeElement, {
      theme: 'snow',
      modules: {
        toolbar: [['bold', 'italic', 'underline'],
          [{ header: [1,2,false] }], ['link', 'code-block']],
        cursors: true,
        history: { userOnly: true }
      },
    });

    this.ydoc = new Y.Doc();
    this.provider = new SocketIOProvider(
      'http://localhost:3000',
      `yjs|${this.docId}`,
      this.ydoc,
      {

      }
    );

    this.provider.awareness.setLocalStateField('user', {
      name: this.userEmail(), 
      color: '#4A6A8A'
    });

    this.yText = this.ydoc.getText('rich');
    this.binding = new QuillBinding(this.yText, this.quill, this.provider.awareness);
  
  }

  getHtml(): string { return this.quill.root.innerHTML; }
  getPlain(): string { return this.yText.toString(); }

  ngOnDestroy() {
    this.host.nativeElement.innerHTML = '';
  }
}
