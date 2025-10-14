import { Component, AfterViewInit, ElementRef, OnDestroy, ViewChild, Input, inject, computed } from '@angular/core';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { QuillBinding } from 'y-quill';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
// import { Comment } from '../../types/comment';

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
  public comments!: Y.Map<any>;
  private provider!: WebsocketProvider;
  private binding!: QuillBinding;
  readonly userEmail = computed(() => this.auth.user()?.email ?? 'Anon');
  public activeCommentId: string | null = null;

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
      this.ydoc
    );

    this.provider.on('sync', (isSynced: boolean) => {
      if (isSynced) {
        this.quill.enable(true);
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
    if (this.activeCommentId === commentId) {
      // Deselect if already active
      this._removeCommentFormatting(commentId);
      return;
    }

    this.updateTextFormatting(commentId);
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

    this.updateTextFormatting(commentId);
    this.comments.delete(commentId);
  }

  ngOnDestroy() {
    this.provider?.destroy();
    this.ydoc?.destroy();
    this.host.nativeElement.innerHTML = '';
  }

  private updateTextFormatting(commentId: string) {
    const comment = this.comments.get(commentId);

    if (!comment) {
      console.warn('No comment found for activeCommentId:', this.activeCommentId);
      return;
    }

    // Remove all formatting
    this._removeAllCommentFormatting();

    this._applyCommentFormatting(commentId);
  }

  _removeAllCommentFormatting() {
    // Remove formatting from all comments
    this.comments.forEach((comment, commentId) => {
      this._removeCommentFormatting(commentId);
    });
    this.activeCommentId = null;
  }

  _removeCommentFormatting(commentId: string) {
    const comment = this.comments.get(commentId);

    if (!comment) {
      console.warn('No comment found for activeCommentId:', this.activeCommentId);
      return;
    }

    try {
      const encodedRelativePos = comment.get('relativePos');

      if (!encodedRelativePos) {
        console.warn('No relativePos found for comment:', this.activeCommentId);
      }

      // Decode relative position
      const relativePos = Y.decodeRelativePosition(encodedRelativePos);
      const absolutePos = Y.createAbsolutePositionFromRelativePosition(relativePos, this.ydoc);

      if (absolutePos && absolutePos.type === this.yText) {
        const index = absolutePos.index;
        const length = comment.get('selectionLength');
        this.quill.formatText(index, length, { background: false }, 'user');
        this.quill.setSelection(index + length);
      }

      this.activeCommentId = null;
    } catch (err) {
      console.error('Failed to remove comment formatting:', err);
    }
  }

  _applyCommentFormatting(commentId: string) {
    const comment = this.comments.get(commentId);

    if (!comment) {
      console.warn('No comment found for activeCommentId:', this.activeCommentId);
      return;
    }

    try {
      const encodedRelativePos = comment.get('relativePos');

      if (!encodedRelativePos) {
        console.warn('No relativePos found for comment:', commentId);
        throw new Error('No relativePos found');
      }

      // Decode the relative position
      const relativePos = Y.decodeRelativePosition(encodedRelativePos);
      const absolutePos = Y.createAbsolutePositionFromRelativePosition(relativePos, this.ydoc);

      // Check if same instance of Y.Text
      if (absolutePos && absolutePos.type === this.yText) {
        const index = absolutePos.index;
        const length = comment.get('selectionLength');

        // Add background and set selection to END of commented text
        this.quill.formatText(index, length, { background: '#d9ff0048' }, 'user');
        this.quill.setSelection(index + length + 1);
      }
    } catch (e) {
      console.error('Failed to apply comment formatting:', e);
      this.quill.setSelection(0);
      this.activeCommentId = null;
      return;
    }
  }
}
