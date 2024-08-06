import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

const API_BASE = `${environment.baseAPI}/api/budgeting`;

@Injectable({
  providedIn: 'root'
})
export class AccountBudgetService {

  constructor(
    private http: HttpClient
  ) { }

  generatePDF(params): Observable<any> {

    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');

    const url = `${API_BASE}/export/pdf?column=${params.column}&fromDate=${params.start}&toDate=${params.end}`;
    
    return this.http.get(url, {
      headers,
      responseType: "arraybuffer"
    });
  }
}
