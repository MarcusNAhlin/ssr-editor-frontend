import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';

interface document {
  _id: string,
  title: string,
  content: string,
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiURL = environment.API_URL;
  private http = inject(HttpClient);

  getDocuments(): Observable<document[]> {
    return this.http.get<document[]>(this.apiURL + '/docs').pipe(
      catchError(this.handleError)
    );;
  }

  addDocument(documentData: document): Observable<document> {
    return this.http.post<document>(this.apiURL + '/docs/add', documentData).pipe(
      catchError(this.handleError)
    );;
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
