import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AccountHistoryModel } from './accountHistory.model';
import { environment } from '../../../environments/environment';
import { QueryParamsModel, QueryResultsModel } from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryAccountHistoryModel } from './queryaccountHistory.model';

const API_BASE = `${environment.baseAPI}/api/acchistory`;
const API_CSV = `${environment.baseAPI}/api/excel/export/acchistory`;

@Injectable({
	providedIn: 'root'
})
export class AccountHistoryService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListAccountHistory(queryParams): Observable<QueryResultsModel> {
		const options = {
			search: queryParams.search,
			page: queryParams.page,
			limit: queryParams.limit,
			fromDate: queryParams.fromDate ? queryParams.fromDate : '',
			toDate: queryParams.toDate ? queryParams.toDate : '',
			sortOrder: queryParams.sortOrder ? queryParams.sortOrder : '',
			sortField: queryParams.sortField ? queryParams.sortField : '',

		};

		const params = new URLSearchParams();

		for (let key in options) {
			//  Skip if the key is empty
			if (key === "search") {
				const fields = {};

				for (let k in options[key]) {
					if (options[key][k]) {
						if (!options[key][k].length) delete fields[k];
						else fields[k] = options[key][k];
					}
				}

				// Skip if there's an empty field
				if (!Object.keys(fields).length) continue;

				options[key] = JSON.stringify(fields);
			}

			params.set(key, options[key]);
		}

		const url = `${API_BASE}/list?${params}`;
		return this.http.get<QueryResultsModel>(url);
	}

	getListAssetAccount(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
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
		return this.http.get<QueryResultsModel>(API_BASE + '/list/fixed?' + params, { headers: httpHeaders });
	}

	getListAccDept(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
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
		return this.http.get<QueryResultsModel>(API_BASE + '/list/accumulated?' + params, { headers: httpHeaders });
	}

	getListAccountHistoryNoParam(): Observable<any> {
		const url = `${API_BASE}/list`;
		return this.http.get<any>(url);
	}

	findAccountHistoryById(_id: string): Observable<any> {
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	deleteAccountHistory(accountHistoryId: string) {
		const url = `${API_BASE}/delete/${accountHistoryId}`;
		return this.http.delete(url);
	}
	updateAccountHistory(accountHistory: AccountHistoryModel) {
		const url = `${API_BASE}/edit/${accountHistory._id}`;
		return this.http.patch(url, accountHistory);
	}
	createAccountHistory(accountHistory: AccountHistoryModel): Observable<AccountHistoryModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<AccountHistoryModel>(`${API_BASE}/add`, accountHistory, { headers: httpHeaders });
	}

	generateAccountHistory(): Observable<AccountHistoryModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<AccountHistoryModel>(`${API_BASE}/generate`, { headers: httpHeaders });
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	exportExcel() {
		return FileSaver.saveAs(`${API_CSV}`, "export-accountHistory.xlsx");
	}
}
