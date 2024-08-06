import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AccountCategoryModel } from './accountCategory.model';
import { environment } from '../../../environments/environment';
import { QueryParamsModel, QueryResultsModel } from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryAccountCategoryModel } from './queryaccountcategory.model';

const API_BASE = `${environment.baseAPI}/api/acccat`;
const API_CSV = `${environment.baseAPI}/api/excel/export/accountCategory`;
const API_ACCOUNT_URL = `${environment.baseAPI}/api/acct`;

@Injectable({
	providedIn: 'root'
})
export class AccountCategoryService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListAccountCategory(queryParams: QueryAccountCategoryModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			search: queryParams.search,
			page: queryParams.page,
			limit: queryParams.limit,
			type: queryParams.type
		}
		let params = new URLSearchParams();
		// for (let key in options) {
		// 	if (key === 'search' && !options[key]) continue
		// 	params.set(key, options[key])

		// }

		for (let key in options) {
			//  Skip if the key is empty
			if (key === 'search') {
				const fields = {};

				for (let k in options[key]) {
					if (options[key][k]) {
						if (!options[key][k].length) delete fields[k];
						else fields[k] = options[key][k]
					};
				}

				// Skip if there's an empty field
				if (!Object.keys(fields).length) continue;

				options[key] = JSON.stringify(fields);
			}

			params.set(key, options[key]);
		}
		// params.set("param", JSON.stringify(queryParams));
		const url = `${API_BASE}/list?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	findAccountCategoryById(_id: string): Observable<QueryResultsModel> {
		const url = `${API_BASE}/${_id}`;
		return this.http.get<QueryResultsModel>(url);
	}

	deleteAccountCategory(accountCategoryId: string) {
		const url = `${API_BASE}/delete/${accountCategoryId}`;
		return this.http.delete(url);
	}

	updateAccountCategory(formValue: AccountCategoryModel) {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		const url = `${API_ACCOUNT_URL}/edit-category`;
		return this.http.patch(url, formValue, { headers: httpHeaders });
	}

	createAccountCategory(accountCategory: AccountCategoryModel): Observable<AccountCategoryModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<AccountCategoryModel>(`${API_BASE}/add`, accountCategory, { headers: httpHeaders });
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
		return FileSaver.saveAs(`${API_CSV}`, "export-accountCategory.xlsx");
	}

	// get lista account
	getListAccountGroup(
		queryParams: QueryAccountCategoryModel
	): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		let options = {
			search: queryParams.search,
			page: queryParams.page,
			limit: queryParams.limit,
		};

		let params = new URLSearchParams();
		for (let key in options) {
			// Skip if search is empty
			if (key === "search" && !options[key]) continue;
			params.set(key, options[key]);
		}

		const url = `${API_ACCOUNT_URL}/list?${params}`;

		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}
}
