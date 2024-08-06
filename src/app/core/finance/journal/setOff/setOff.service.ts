import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SetOffModel } from './setOff.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { QueryResultsModel } from '../../../_base/crud';

import * as FileSaver from 'file-saver';
import { QuerySetOffModel } from './querysetOff.model';
import { query } from 'chartist';

const API_BASE = `${environment.baseAPI}/api/jousetoff`;
const API_CSV = `${environment.baseAPI}/api/excel/export/setoff`;

@Injectable({
	providedIn: 'root'
})
export class SetOffService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListSetOff(queryParams: QuerySetOffModel): Observable<QueryResultsModel> {
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

	getListSetOffTotal(queryParams: QuerySetOffModel): Observable<QueryResultsModel> {
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


	getAllSelectVoucher(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		httpHeaders.set('Content-Type', 'application/json');

		return this.http.get<any>(API_BASE + '/list/selectvoucherbill?' + params, { headers: httpHeaders });
	}

	getAllSelectVoucherNo(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		httpHeaders.set('Content-Type', 'application/json');

		return this.http.get<any>(API_BASE + '/list/selectvoucherno?' + params, { headers: httpHeaders });
	}

	getDetailTagihanBill(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.get<any>(API_BASE + '/list/tagihanbill?' + params, { headers: httpHeaders });
	}


	findSetOffById(_id: string): Observable<SetOffModel> {

		return this.http.get<SetOffModel>(`${API_BASE}/${_id}`);
	}

	deleteSetOff(setOffId: string) {
		const url = `${API_BASE}/delete/${setOffId}`;
		return this.http.delete(url);
	}
	updateSetOff(setOff: SetOffModel) {
		const url = `${API_BASE}/update/${setOff._id}`;
		return this.http.patch(url, setOff);
	}

	createSetOff(setOff: SetOffModel): Observable<SetOffModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<SetOffModel>(`${API_BASE}/add`, setOff, { headers: httpHeaders });
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
		return FileSaver.saveAs(`${API_CSV}?startDate=${_date.startDate}&endDate=${_date.endDate}`, `export-journal-setoff-${_date.startDate}-${_date.endDate}.xlsx`);
	}
}
