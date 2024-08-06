import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { WriteOffModel } from './writeOff.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { QueryResultsModel } from '../../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryWriteOffModel } from './querywriteOff.model';
import { query } from 'chartist';

const API_BASE = `${environment.baseAPI}/api/jouwriteoff`;
const API_CSV = `${environment.baseAPI}/api/excel/export/writeoff`;

@Injectable({
	providedIn: 'root'
})
export class WriteOffService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListWriteOff(queryPwriteOffams: QueryWriteOffModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		let options = {
			param: JSON.stringify(queryPwriteOffams)
		}
		for (let key in options) {
			params.set(key, options[key]);
		}

		return this.http.get<QueryResultsModel>(API_BASE + '/list?' + params, { headers: httpHeaders });
	}


	findWriteOffById(_id: string): Observable<WriteOffModel> {

		return this.http.get<WriteOffModel>(`${API_BASE}/${_id}`);
	}

	deleteWriteOff(writeOffId: string) {
		const url = `${API_BASE}/delete/${writeOffId}`;
		return this.http.delete(url);
	}
	updateWriteOff(writeOff: WriteOffModel) {
		const url = `${API_BASE}/update/${writeOff._id}`;
		return this.http.patch(url, writeOff);
	}

	getDetailTagihanBill(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.get<any>(API_BASE + '/list/tagihanbill?' + params, { headers: httpHeaders });
	}

	getAllSelectVoucher(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		httpHeaders.set('Content-Type', 'application/json');

		return this.http.get<any>(API_BASE + '/list/selectvoucherbill?' + params, { headers: httpHeaders });
	}

	getListWriteOffTotal(queryParams: any): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		let options = {
			param: JSON.stringify(queryParams)
		}
		for (let key in options) {
			params.set(key, options[key]);
		}
		return this.http.get<any>(API_BASE + '/list?' + params, { headers: httpHeaders });
	}


	createWriteOff(writeOff: WriteOffModel): Observable<WriteOffModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<WriteOffModel>(`${API_BASE}/add`, writeOff, { headers: httpHeaders });
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
		return FileSaver.saveAs(`${API_CSV}?startDate=${_date.startDate}&endDate=${_date.endDate}`, `export-journal-writeoff-${_date.startDate}-${_date.endDate}.xlsx`);
	}
}
