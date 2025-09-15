import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
    return this.http.get<document[]>(this.apiURL + '/docs');
  }
}
