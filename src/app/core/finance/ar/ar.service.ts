import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ArModel } from './ar.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel } from '../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryArModel } from './queryar.model';
import { query } from 'chartist';

const API_BASE = `${environment.baseAPI}/api/accreceive`;
const API_CSV = `${environment.baseAPI}/api/excel/export/ar`;

@Injectable({
	providedIn: 'root'
})
export class ArService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListAr(queryParams: QueryArModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		let options = {
			param: JSON.stringify(queryParams)
		}
		for (let key in options) {
			params.set(key, options[key]);
		}

		return this.http.get<QueryResultsModel>(API_BASE + '/list?' + params, { headers: httpHeaders });
	}


	findArById(_id: string): Observable<ArModel> {

		return this.http.get<ArModel>(`${API_BASE}/${_id}`);
	}

	deleteAr(arId: string) {
		const url = `${API_BASE}/delete/${arId}`;
		return this.http.delete(url);
	}
	updateAr(ar: ArModel) {
		const url = `${API_BASE}/edit/${ar._id}`;
		return this.http.patch(url, ar);
	}

	listHistoryAR(
		id: any
	): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		// let params = new URLSearchParams();
		// params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(
			API_BASE + "/list/history/" + id,
			{ headers: httpHeaders }
		);
	}

	getVoucherBill(queryParams: any): Observable<QueryResultsModel> {
		console.log(queryParams, "queryParans Add Park");

		const httpHeaders = new HttpHeaders();
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));


		return this.http.get<any>(`${API_BASE}/list/getbill?${params}`, { headers: httpHeaders });
	}

	getListARTotal(queryParams: any): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		let options = {
			param: JSON.stringify(queryParams)
		}
		for (let key in options) {
			params.set(key, options[key]);
		}

		return this.http.get<QueryResultsModel>(API_BASE + '/list?' + params, { headers: httpHeaders });
	}



	createAr(ar: ArModel): Observable<ArModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ArModel>(`${API_BASE}/add`, ar, { headers: httpHeaders });
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	exportExcel(ar) {
		return FileSaver.saveAs(`${API_CSV}?startDate=${ar.startDate}&endDate=${ar.endDate}`, `export-ar-${ar.startDate}-${ar.endDate}.xlsx`);
	}
}
