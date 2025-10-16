import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, computed } from '@angular/core';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Document } from '../types/document';
import { Share } from '../types/share';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private auth = inject(AuthService);
  private apiURL = environment.API_URL;
  private codeAPIURL = environment.CODE_API_URL;
  private http = inject(HttpClient);

  userId = computed(() => this.auth.user()?._id ?? '');


  getDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiURL + '/docs').pipe(
      catchError(this.handleError)
    );;
  }

  getDocument(_id: string): Observable<Document> {
    const res = this.http.post<Document>(this.apiURL + '/graphql',JSON.stringify({ query: `{ document( id: ${_id}, _id: ${this.userId()} ) {_id, type} }` }), { headers: { 'Content-Type': 'application/json' } }).pipe(
      catchError(this.handleError)
    );;
    console.log(this.userId());
    console.log(_id);
    console.log(res);
    return res;
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
