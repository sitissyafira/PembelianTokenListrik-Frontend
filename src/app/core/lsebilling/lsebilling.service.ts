import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { LsebillingModel } from './lsebilling.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryLsebillingModel } from './querylsebilling.model';

const API_LB_URL = `${environment.baseAPI}/api/leasebilling`;
const API_CSV = `${environment.baseAPI}/api/excel/leasebilling/export`;



@Injectable({
	providedIn: 'root'
})
export class LsebillingService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListLsebilling(queryParams: QueryLsebillingModel): Observable<QueryResultsModel>{
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
		return this.http.get<QueryResultsModel>(API_LB_URL + '/list?' + params,{ headers: httpHeaders });
	}

	
	findLsebillingById(_id: string): Observable<LsebillingModel>{
		return this.http.get<LsebillingModel>(`${API_LB_URL}/${_id}`);
	}
	deleteLsebilling(lsebillingId: string) {
		const url = `${API_LB_URL}/delete/${lsebillingId}`;
		return this.http.delete(url);
	}
	updateLsebilling(lsebilling: LsebillingModel) {
		const url = `${API_LB_URL}/edit/${lsebilling._id}`;
		return this.http.patch(url, lsebilling);
	}
	createLsebilling(lsebilling: LsebillingModel): Observable<LsebillingModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<LsebillingModel>(`${API_LB_URL}/add`, lsebilling, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-lsebilling.xlsx");
	}

	generateCodeLeaseBiling(): Observable<QueryResultsModel>{
		const url = `${API_LB_URL}/generate/CodeLeaseBiling`;
		return this.http.get<QueryResultsModel>(url);
	}
}
