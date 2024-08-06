import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

import { environment } from "../../../../environments/environment";
import * as FileSaver from 'file-saver';

const API_BASE = `${environment.baseAPI}/api/newFinance/report`;
const API_EXCEL = `${environment.baseAPI}/api/report/finance/excel/gl`;

@Injectable({
  providedIn: "root"
})
export class GlService {

  constructor(
    private http: HttpClient
  ) { }

  //PDF
  generatePDF(params): Observable<any> {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');

    const url = `${API_BASE}/tb/generated?column=${params.column}&fromDate=${params.start}&toDate=${params.end}&account=${params.account}`;

    return this.http.get(url, { headers });
  }

  /** Export Excel Report. */
  generateExcel(params): Observable<any> {
    const headers = new HttpHeaders();
    headers.set("Content-Type", "application/json");

    const url = `${API_EXCEL}/summary?column=${params.column}&fromDate=${params.start}&toDate=${params.end}`;
    return this.http.get(url, {
      headers,
      responseType: "arraybuffer",
    });
  }

  exportExcel() {
    return FileSaver.saveAs(`${API_EXCEL}`, "export-gl.xlsx");
  }
}
