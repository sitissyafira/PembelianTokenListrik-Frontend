import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BudgetingModel } from './budgeting.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryParamsModel, QueryResultsModel} from '../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryBudgetingModel } from './querybudgeting.model';

// const API_BASE = `${environment.baseAPI}/api/acctype`;
const API_BASE = `${environment.baseAPI}/api/budgeting`;
const API_CSV = `${environment.baseAPI}/api/excel/budgeting/export`;

@Injectable({
	providedIn: 'root'
})
export class BudgetingService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListBudgeting(queryParams: QueryBudgetingModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			search : queryParams.search,
			pageNumber : queryParams.pageNumber,
			limit : queryParams.limit
		}
		let params = new URLSearchParams();
		for (let key in options) {
			if (key === 'search' && !options[key]) continue
			params.set(key, options[key])

		}
		// params.set("param", JSON.stringify(queryParams));
		const url = `${API_BASE}/list?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	findBudgetingById(_id: string): Observable<BudgetingModel>{
		return this.http.get<BudgetingModel>(`${API_BASE}/${_id}`);
	}

	deleteBudgeting(budgetingId: string) {
		const url = `${API_BASE}/deleteflag/${budgetingId}`;
		return this.http.delete(url);
	}

	deleteFlagBudgeting(budgeting: BudgetingModel) {
		const url = `${API_BASE}/deleteflag/${budgeting._id}`;
		return this.http.patch(url, budgeting);
	}

	updateBudgeting(budgeting: BudgetingModel) {
		const url = `${API_BASE}/edit/${budgeting._id}`;
		return this.http.patch(url, budgeting);
	}
	createBudgeting(budgeting: BudgetingModel): Observable<BudgetingModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<BudgetingModel>(`${API_BASE}/add`, budgeting, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-budgeting.xlsx");
	}
}
