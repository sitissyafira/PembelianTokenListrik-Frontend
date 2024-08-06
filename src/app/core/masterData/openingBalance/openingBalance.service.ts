import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { OpeningBalanceModel } from './openingBalance.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryParamsModel, QueryResultsModel} from '../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryOpeningBalanceModel } from './queryaopeningBalance.model';

const API_BASE = `${environment.baseAPI}/api/balance`;
const API_CSV = `${environment.baseAPI}/api/excel/balance`;

@Injectable({
	providedIn: 'root'
})
export class OpeningBalanceService {
	constructor(private http: HttpClient) {}
	getListOpeningBalance(queryParams: QueryOpeningBalanceModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			search : queryParams.search,
			page : queryParams.page,
			limit : queryParams.limit
		}
		let params = new URLSearchParams();
		for (let key in options) {
			if (key === 'search' && !options[key]) continue
			params.set(key, options[key])
		}
		const url = `${API_BASE}/list?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	findOpeningBalanceById(_id: string): Observable<OpeningBalanceModel>{
		return this.http.get<OpeningBalanceModel>(`${API_BASE}/${_id}`);
	}
	deleteOpeningBalance(openingBalanceId: string) {
		const url = `${API_BASE}/delete/${openingBalanceId}`;
		return this.http.delete(url);
	}
	updateOpeningBalance(openingBalance: OpeningBalanceModel) {
		const url = `${API_BASE}/edit/${openingBalance._id}`;
		return this.http.patch(url, openingBalance);
	}
	createOpeningBalance(openingBalance: OpeningBalanceModel): Observable<OpeningBalanceModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<OpeningBalanceModel>(`${API_BASE}/add`, openingBalance, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-openingBalance.xlsx");
	}
}
