import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FitnessClass } from '@text2rest/shared';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFitnessClasses(filters: Partial<FitnessClass> = {}): Observable<FitnessClass[]> {
    return this.http.get<FitnessClass[]>(this.apiUrl, { params: filters });
  }
}
