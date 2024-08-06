import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AdjustmentModel } from './adjustment.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { QueryResultsModel } from '../../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryAdjustmentModel } from './queryadjustment.model';
import { query } from 'chartist';

const API_BASE = `${environment.baseAPI}/api/joupen`;
const API_CSV = `${environment.baseAPI}/api/excel/export/penyesuaian`;

@Injectable({
	providedIn: 'root'
})
export class AdjustmentService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListAdjustment(queryPadjustmentams: QueryAdjustmentModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		let options = {
			param: JSON.stringify(queryPadjustmentams)
		}
		for (let key in options) {
			params.set(key, options[key]);
		}

		return this.http.get<QueryResultsModel>(API_BASE + '/list?' + params, { headers: httpHeaders });
	}

	getListAdjustmentTotal(queryParams: any): Observable<QueryResultsModel> {
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

	findAdjustmentById(_id: string): Observable<AdjustmentModel> {
		return this.http.get<AdjustmentModel>(`${API_BASE}/${_id}`);
	}

	deleteAdjustment(adjustmentId: string) {
		const url = `${API_BASE}/delete/${adjustmentId}`;
		return this.http.delete(url);
	}
	updateAdjustment(adjustment: AdjustmentModel) {
		const url = `${API_BASE}/update/${adjustment._id}`;
		return this.http.patch(url, adjustment);
	}

	createAdjustment(adjustment: AdjustmentModel): Observable<AdjustmentModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<AdjustmentModel>(`${API_BASE}/add`, adjustment, { headers: httpHeaders });
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
		return FileSaver.saveAs(`${API_CSV}?startDate=${_date.startDate}&endDate=${_date.endDate}`, `export-journal-memorial-${_date.startDate}-${_date.endDate}.xlsx`);
	}
}
