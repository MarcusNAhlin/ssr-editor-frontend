import { Component, AfterViewInit, ElementRef, OnDestroy, ViewChild, Input, inject, computed, signal } from '@angular/core';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { QuillBinding } from 'y-quill';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { QuillCursorsModule } from '../../types/comment';

Quill.register('modules/cursors', QuillCursors);

@Component({
  selector: 'app-quill-editor',
  imports: [CommonModule],
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
  private yText!: Y.Text;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public comments!: Y.Map<any>;
  private provider!: WebsocketProvider;
  private binding!: QuillBinding;
  readonly userEmail = computed(() => this.auth.user()?.email ?? 'Anon');
  public activeCommentId: string | null = null;

  public connectionStatus = signal<'loading' | 'connected' | 'failed'>('loading');
  public connectionError = signal<string | null>(null);
  private retryCount = signal<number>(0);

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

    this.quill.enable(false);

    this.ydoc = new Y.Doc();
    this.provider = new WebsocketProvider(
      environment.API_WS_URL,
      this.docId,
      this.ydoc,
      {
        maxBackoffTime: 10000,
        connect: true,
        params: { access_token: this.auth.getToken() || '' }
      }
    );

    this.provider.on('sync', (isSynced: boolean) => {
      if (isSynced) {
        this.quill.enable(true);
      }
    });

    const MAX_RETRIES = 3;
    this.provider.on('status', (event: { status: string }) => {
      if (event.status === 'connecting') {
        this.connectionStatus.set('loading');
        this.connectionError.set(null);
        this.retryCount.set(this.retryCount() + 1);

        if (this.retryCount() >= MAX_RETRIES) {
          this.provider.disconnect();
          this.connectionStatus.set('failed');
          this.connectionError.set('Maximum connection attempts reached, refresh the page to try again');
        }

        if (this.retryCount() < MAX_RETRIES) {
          this.connectionStatus.set('loading');
          this.connectionError.set('Attempting to reconnect... (' + this.retryCount() + '/' + MAX_RETRIES + ')');
        }
      }

      if (event.status === 'connected') {
        this.connectionStatus.set('connected');
        this.connectionError.set(null);
        this.retryCount.set(0);
      }

      if (event.status === 'disconnected') {
        this.connectionStatus.set('failed');
        this.connectionError.set('Disconnected');
      }
    });

    this.provider.on('connection-close', (event) => {
      if (!event) return;

      // If unauthorized
      if (event.code === 4001) {
        this.provider.disconnect();
        this.connectionStatus.set('failed');
        this.connectionError.set('Unauthorized. Try refreshing the page or log in again.');
        this.quill.enable(false);
      }

      if (event.code !== 4001 && this.retryCount() >= MAX_RETRIES) {
        this.connectionStatus.set('failed');
        this.connectionError.set(`Connection closed: ${event.reason}`);
        this.quill.enable(false);
      }

      if (event.code !== 4001 && this.retryCount() < MAX_RETRIES) {
        this.connectionStatus.set('loading');
        this.quill.enable(false);
      }
    });

    this.provider.awareness.setLocalStateField('user', {
      name: this.userEmail(),
      color: '#d9ff00ff'
    });

    this.yText = this.ydoc.getText('rich');
    this.comments = this.ydoc.getMap('comments');

    this.binding = new QuillBinding(this.yText, this.quill, this.provider.awareness);
  }

  getHtml(): string { return this.quill.root.innerHTML; }
  getPlain(): string { return this.yText.toString(); }

  addComment(commentInputElement: HTMLInputElement) {
    const commentId = crypto.randomUUID();
    const comment = new Y.Map();

    comment.set('id', commentId);
    comment.set('text', commentInputElement.value);
    comment.set('author', this.userEmail());
    comment.set('timestamp', Date.now());
    comment.set('resolved', false); // TODO: Add ability to resolve comments (instead of delete)

    const selection = this.quill.getSelection();
    if (selection) {
      // Get a relative position from the currently selected text
      const relativePos = Y.createRelativePositionFromTypeIndex(this.yText, selection.index);
      // Need to encode position to be able to store in in a Yjs map
      const encodedRelativePos = Y.encodeRelativePosition(relativePos);
      comment.set('relativePos', encodedRelativePos);
      comment.set('selectionLength', selection.length);
    }

    this.comments.set(commentId, comment);

    commentInputElement.value = '';
  }

  selectTextInComment(commentId: string) {
    this._updateCommentHighlight(commentId);
  }

  removeComment(commentId: string) {
    const comment = this.comments.get(commentId);

    if (!comment) {
      console.warn('Comment not found:', commentId);
      return;
    }

    // Open a browser confirm dialog
    // TODO: Replace with own modal
    if (!confirm(`Are you sure you want to remove comment: "${comment.get('text')}"`)) {
      return;
    }

    this.activeCommentId = commentId;
    this._updateCommentHighlight(commentId);
    this.comments.delete(commentId);
  }

  ngOnDestroy() {
    this.provider?.destroy();
    this.ydoc?.destroy();
    this.host.nativeElement.innerHTML = '';
  }

  private _updateCommentHighlight(commentId: string) {
    const comment = this.comments.get(commentId);

    if (!comment) {
      console.warn('No comment found for activeCommentId:', this.activeCommentId);
      return;
    }

    if (this.activeCommentId === commentId) {
      this._removeCommentHighlight(commentId);
      this.activeCommentId = null;
      return;
    }

    if (this.activeCommentId !== commentId) {
      if (this.activeCommentId) this._removeCommentHighlight(this.activeCommentId);

      this._applyCommentHighlight(commentId);
      this.activeCommentId = commentId;
    }
  }

  private _getCursorsModule() {
    return this.quill.getModule('cursors') as QuillCursorsModule;
  }

  private _removeCommentHighlight(commentId: string) {
    const cursors = this._getCursorsModule();
    cursors.removeCursor(commentId);
  }

  private _applyCommentHighlight(commentId: string) {
    const comment = this.comments.get(commentId);
    if (!comment) return;

    const encodedRelativePos = comment.get('relativePos');
    if (!encodedRelativePos) return;

    const relativePos = Y.decodeRelativePosition(encodedRelativePos);
    const absolutePos = Y.createAbsolutePositionFromRelativePosition(relativePos, this.ydoc);

    if (absolutePos && absolutePos.type === this.yText) {
      const index = absolutePos.index;
      const length = comment.get('selectionLength');

      const cursors = this._getCursorsModule();
      cursors.createCursor(commentId, `Comment by - ${comment.get('author')} - ${new Date(comment.get('timestamp')).toLocaleString()}`, '#d9ff0063');
      cursors.moveCursor(commentId, { index, length });
    }
  }
}
