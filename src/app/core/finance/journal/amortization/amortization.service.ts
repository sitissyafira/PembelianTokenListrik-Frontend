import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AmortizationModel } from './amortization.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { QueryResultsModel } from '../../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryAmortizationModel } from './queryamortization.model';
import { query } from 'chartist';

const API_BASE = `${environment.baseAPI}/api/jouamor`;
const API_CSV = `${environment.baseAPI}/api/excel/export/amortization`;

@Injectable({
	providedIn: 'root'
})
export class AmortizationService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListAmortization(queryPamortizationams: QueryAmortizationModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		let options = {
			param: JSON.stringify(queryPamortizationams)
		}
		for (let key in options) {
			params.set(key, options[key]);
		}

		return this.http.get<QueryResultsModel>(API_BASE + '/list?' + params, { headers: httpHeaders });
	}

	getListAmortizationTotal(queryPamortizationams: QueryAmortizationModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		let options = {
			param: JSON.stringify(queryPamortizationams)
		}
		for (let key in options) {
			params.set(key, options[key]);
		}



		return this.http.get<QueryResultsModel>(API_BASE + '/list?' + params, { headers: httpHeaders });
	}


	findAmortizationById(_id: string): Observable<AmortizationModel> {

		return this.http.get<AmortizationModel>(`${API_BASE}/${_id}`);
	}

	deleteAmortization(amortizationId: string) {
		const url = `${API_BASE}/delete/${amortizationId}`;
		return this.http.delete(url);
	}
	updateAmortization(amortization: AmortizationModel) {
		const url = `${API_BASE}/update/${amortization._id}`;
		return this.http.patch(url, amortization);
	}

	createAmortization(amortization: AmortizationModel): Observable<AmortizationModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<AmortizationModel>(`${API_BASE}/add`, amortization, { headers: httpHeaders });
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	exportExcel(_date) {
		return FileSaver.saveAs(`${API_CSV}?startDate=${_date.startDate}&endDate=${_date.endDate}`, `export-journal-amortization-${_date.startDate}-${_date.endDate}.xlsx`);
	}
}
