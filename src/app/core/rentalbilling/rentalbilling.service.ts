import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RentalbillingModel } from './rentalbilling.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryRentalbillingModel } from './queryrentalbilling.model';

const API_RTLBILL_URL = `${environment.baseAPI}/api/rentalbilling`;
const API_CSV = `${environment.baseAPI}/api/excel/rentalbilling/export`;

@Injectable({
	providedIn: 'root'
})
export class RentalbillingService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListRentalbilling(queryParams: QueryRentalbillingModel): Observable<QueryResultsModel>{
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
		return this.http.get<QueryResultsModel>(API_RTLBILL_URL + '/list?' + params,{ headers: httpHeaders });
		
	}

	findRentalbillingById(_id: string): Observable<RentalbillingModel>{
		return this.http.get<RentalbillingModel>(`${API_RTLBILL_URL}/${_id}`);
	}
	deleteRentalbilling(rentalbillingId: string) {
		const url = `${API_RTLBILL_URL}/delete/${rentalbillingId}`;
		return this.http.delete(url);
	}
	updateRentalbilling(rentalbilling: RentalbillingModel) {
		const url = `${API_RTLBILL_URL}/edit/${rentalbilling._id}`;
		return this.http.patch(url, rentalbilling);
	}

	createRentalbilling(rentalbilling: RentalbillingModel): Observable<RentalbillingModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<RentalbillingModel>(`${API_RTLBILL_URL}/add`, rentalbilling, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	generateCodeRentalBiling(): Observable<QueryResultsModel>{
		const url = `${API_RTLBILL_URL}/generate/CodeRentalBiling`;
		return this.http.get<QueryResultsModel>(url);
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-rentalbilling.xlsx" );
	}
}
