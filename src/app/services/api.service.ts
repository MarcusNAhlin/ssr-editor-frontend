import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, computed } from '@angular/core';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Document, GqlResDoc, GqlResDocs } from '../types/document';
import { Share } from '../types/share';
import { AuthService } from './auth.service';

const DOCUMENT_FIELDS = `
  fragment DocumentFields on Document {
    _id
    owner
    type
    title
    sharedWith { id email }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private auth = inject(AuthService);
  private apiURL = environment.API_URL;
  private codeAPIURL = environment.CODE_API_URL;
  private http = inject(HttpClient);

  readonly userId = computed(() => this.auth.user()?._id ?? '');

  getDocuments(): Observable<Document[]> {
    const QUERY = `
      ${DOCUMENT_FIELDS}
      query Documents($userId: ID!) {
        documents(_id: $userId) {
          ...DocumentFields
        }
      }
    `;

    const userId = this.userId();
    
    if (!userId) {
      return throwError(() => new Error('No user is logged in.'));
    }

    return this.http.post<GqlResDocs>(
      `${this.apiURL}/graphql`,
      { query: QUERY, variables: { userId }, operationName: 'Documents' },
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      map(res => {
        return res.data.documents;
      }),
      catchError(this.handleError)
    );
  }

  getDocument(_id: string): Observable<Document> {
    const QUERY = `
      ${DOCUMENT_FIELDS}
      query Document($id: ID!, $userId: ID!) {
        document(id: $id, _id: $userId) {
          ...DocumentFields
        }
      }
    `;
    const userId = this.userId();

    if (!userId) {
      return throwError(() => new Error('No user is logged in.'));
    }

    return this.http.post<GqlResDoc>(
      `${this.apiURL}/graphql`,
      { query: QUERY, variables: { id: _id, userId }, operationName: 'Document' },
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      map(res => {
        return res.data.document;
      }),
      catchError(this.handleError)
    );
  }

  addDocument(documentData: Document): Observable<Document> {
    return this.http.post<Document>(this.apiURL + '/docs/add', documentData).pipe(
      catchError(this.handleError)
    );;
  }

  editDocument(documentData: Document): Observable<Document> {
    return this.http.put<Document>(this.apiURL + '/docs/update', documentData).pipe(
      catchError(this.handleError)
    );;
  }

  deleteDocument(_id: Document['_id']): Observable<Document> {
    return this.http.delete<Document>(this.apiURL + '/docs/' + _id).pipe(
      catchError(this.handleError)
    );;
  }

  shareDocument(_id: Document['_id'], userData: {shareToEmail: string}): Observable<Share> {
    return this.http.post<Share>(this.apiURL + '/docs/' + _id + '/share', userData).pipe(
      catchError(this.handleError)
    );;
  }

  runCode(code: string): Observable<{data: string}> {
    const formattedCode = btoa(code);

    return this.http.post<{data: string}>(
      this.codeAPIURL,
      JSON.stringify({ code: formattedCode }),
      {
        headers: { 'X-Skip-Auth': 'true', 'Content-Type': 'application/json' }
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
