import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AccountTypeModel } from './accountType.model';
import { environment } from '../../../environments/environment';
import {QueryParamsModel, QueryResultsModel} from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryAccountTypeModel } from './queryaccounttype.model';

const API_BASE = `${environment.baseAPI}/api/acctype`;
const API_CSV = `${environment.baseAPI}/api/excel/export/accountType`;

@Injectable({
	providedIn: 'root'
})
export class AccountTypeService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListAccountType(queryParams: QueryAccountTypeModel): Observable<QueryResultsModel>{
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
		// params.set("param", JSON.stringify(queryParams));
		const url = `${API_BASE}/list?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getListAssetAccount(queryParams: QueryParamsModel): Observable<QueryResultsModel>{
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
		return this.http.get<QueryResultsModel>(API_BASE + '/list/fixed?' + params,{ headers: httpHeaders });
	}

	getListAccDept(queryParams: QueryParamsModel): Observable<QueryResultsModel>{
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
		return this.http.get<QueryResultsModel>(API_BASE + '/list/accumulated?' + params,{ headers: httpHeaders });
	}

	getListDEA(queryParams: QueryParamsModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(API_BASE + '/list/expensecogs?' + params,{ headers: httpHeaders });
	}


	getListAccountTypeNoParamAccBudget(): Observable<QueryResultsModel> {
		const url = `${API_BASE}/all/list_AccBudget`;
		return this.http.get<QueryResultsModel>(url);
	}
	
	getListAccountTypeNoParam(): Observable<QueryResultsModel> {
		const url = `${API_BASE}/all/list`;
		return this.http.get<QueryResultsModel>(url);
	}

	findAccountTypeById(_id: string): Observable<AccountTypeModel>{
		return this.http.get<AccountTypeModel>(`${API_BASE}/${_id}`);
	}
	deleteAccountType(accountTypeId: string) {
		const url = `${API_BASE}/delete/${accountTypeId}`;
		return this.http.delete(url);
	}
	updateAccountType(accountType: AccountTypeModel) {
		const url = `${API_BASE}/edit/${accountType._id}`;
		return this.http.patch(url, accountType);
	}
	createAccountType(accountType: AccountTypeModel): Observable<AccountTypeModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<AccountTypeModel>(`${API_BASE}/add`, accountType, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-accountType.xlsx");
	}
}
