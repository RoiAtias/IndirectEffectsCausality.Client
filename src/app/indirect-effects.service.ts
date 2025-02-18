import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class IndirectEffectsService {

  electedMovies!: string[];

  constructor(private http: HttpClient) { }
  
  private apiUrl = 'http://127.0.0.1:5000/api/indirectEffects';

  // getData(searchName: string, pageNumber: string, pageSize: string): Observable<any> {
  //   let params = new HttpParams().set('searchName', searchName).set('pageNumber', pageNumber).set('pageSize', pageSize);
  //   return this.http.get<any>(this.apiUrl, { params });
  // }

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/upload`, formData);
  }

  sendResults(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/results`, formData);
  }

}
