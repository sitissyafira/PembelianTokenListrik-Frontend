import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PowbillModel } from './powbill.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryPowbillModel } from './querypowbill.model';

const API_FLOOR_URL = `${environment.baseAPI}/api/powbill`;
const API_CSV = `${environment.baseAPI}/api/excel/pwbilling/export`;




@Injectable({
	providedIn: 'root'
})
export class PowbillService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListPowbill(queryParams: QueryPowbillModel): Observable<QueryResultsModel>{
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
		return this.http.get<QueryResultsModel>(API_FLOOR_URL + '/list?' + params,{ headers: httpHeaders });
	}

	
	findPowbillById(_id: string): Observable<PowbillModel>{
		return this.http.get<PowbillModel>(`${API_FLOOR_URL}/${_id}`);
	}
	deletePowbill(powbillId: string) {
		const url = `${API_FLOOR_URL}/delete/${powbillId}`;
		return this.http.delete(url);
	}
	updatePowbill(powbill: PowbillModel) {
		const url = `${API_FLOOR_URL}/edit/${powbill._id}`;
		return this.http.patch(url, powbill);
	}
	createPowbill(powbill: PowbillModel): Observable<PowbillModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PowbillModel>(`${API_FLOOR_URL}/add`, powbill, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-powbill.xlsx");
	}

	generateCodePowerBiling(): Observable<QueryResultsModel>{
		const url = `${API_FLOOR_URL}/generate/CodePowBiling`;
		return this.http.get<QueryResultsModel>(url);
	}
}
