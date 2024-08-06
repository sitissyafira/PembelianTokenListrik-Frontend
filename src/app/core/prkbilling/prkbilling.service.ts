import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PrkbillingModel } from './prkbilling.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QueryResultsModel } from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryPrkbillingModel } from './queryprkbilling.model';

const API_PARKBILLING_URL = `${environment.baseAPI}/api/parkingbilling`;
const API_CSV = `${environment.baseAPI}/api/excel/parkingbilling`;
const API_GPB = `${environment.baseAPI}/api/parkingbilling`;

@Injectable({
	providedIn: 'root'
})

export class PrkbillingService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListPrkbilling(queryParams: QueryPrkbillingModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		// let options = {
		// 	param: JSON.stringify(queryParams)
		// }
		let params = new URLSearchParams();
		// for (let key in options) {
		// 	console.log(options)
		// 	params.set(key, options[key])
		// }
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(API_PARKBILLING_URL + '/list?' + params, { headers: httpHeaders });
	}

	generateCodeLeaseBiling(): Observable<QueryResultsModel> {
		const url = `${API_PARKBILLING_URL}/generate/CodeLeaseBiling`;
		return this.http.get<QueryResultsModel>(url);
	}


	findPrkbillingById(_id: string): Observable<PrkbillingModel> {
		return this.http.get<PrkbillingModel>(`${API_PARKBILLING_URL}/${_id}`);
	}
	deletePrkbilling(prkbillingId: string) {
		const url = `${API_PARKBILLING_URL}/delete/${prkbillingId}`;
		return this.http.delete(url);
	}
	updatePrkbilling(prkbilling: PrkbillingModel) {
		const url = `${API_PARKBILLING_URL}/edit/${prkbilling._id}`;
		return this.http.patch(url, prkbilling);
	}
	createPrkbilling(prkbilling: PrkbillingModel): Observable<PrkbillingModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PrkbillingModel>(`${API_PARKBILLING_URL}/add`, prkbilling, { headers: httpHeaders });
	}
	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	generateExcel(params): Observable<any> {
		const url = `${API_CSV}/export?column=${params.column}&fromDate=${params.start}&toDate=${params.end}`;
		return FileSaver.saveAs(`${url}`, "export-parkingbilling.xlsx");
	}

	generatePrkBilling(params): Observable<any> {
		const url = `${API_GPB}/generate-parkbill?column=${params.column}&fromDate=${params.start}&toDate=${params.end}`;
		return FileSaver.saveAs(`${url}`, "export-parkingbilling.generate.xlsx");
	}

	// exportExcel() {
	// 	return FileSaver.saveAs(`${API_CSV}`, "export-parkingbilling.xlsx");
	// }
}
