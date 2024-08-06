import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  private baseUrl = `${environment.baseAPI}`;

  constructor(private http: HttpClient) { }

  upload(file: File, unitName): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    const untFileName = `${unitName.replace(/\//g, '')}_${moment().format('DD-MM-YYYY-HH-mm-ss-SSS',)}`

    formData.append('file', file, untFileName);

    const req = new HttpRequest('POST', `${this.baseUrl}/api/power/transaksi/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  getFiles(): Observable<any> {
    //return this.http.get(`${this.baseUrl}/uploads`);
    return this.http.get(`${this.baseUrl}/upload/consumption/electricity`);
  }
}
