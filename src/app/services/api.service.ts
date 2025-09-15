import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiURL = environment.API_URL;

  constructor(private http: HttpClient) { }

  getDocuments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + '/docs')
  }
}
