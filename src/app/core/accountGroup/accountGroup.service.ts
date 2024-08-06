import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { AccountGroupModel } from "./accountGroup.model";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { QueryParamsModel, QueryResultsModel } from "../_base/crud";

import * as FileSaver from "file-saver";
import { QueryAccountGroupModel } from "./queryag.model";

const API_ACCOUNT_URL = `${environment.baseAPI}/api/acct`;
// const API_EXCEL = `${environment.baseAPI}/api/excel/billing/accountType`;
const API_EXCEL = `${environment.baseAPI}/api/excel/billing/export-coa`;
const API_AMORTIZATION = `${environment.baseAPI}/api/jouamor`
const API_ACCOUNT_BANK_URL = `${environment.baseAPI}/api/acct/list-bank`;

@Injectable({
	providedIn: "root",
})
export class AccountGroupService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListAccountGroup(
		queryParams: QueryAccountGroupModel
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

	getListCashBank(
		queryParams: QueryParamsModel
	): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		// let options = {
		// 	param: JSON.stringify(queryParams)
		// }
		let params = new URLSearchParams();
		// for (let key in options) {
		// 	console.log(options)
		// 	params.set(key, options[key])
		// }
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(
			API_ACCOUNT_URL + "/list/acctype/cashbank?" + params,
			{ headers: httpHeaders }
		);
	}
	getListCashBankAR(
		queryParams: QueryParamsModel
	): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		// let options = {
		// 	param: JSON.stringify(queryParams)
		// }
		let params = new URLSearchParams();
		// for (let key in options) {
		// 	console.log(options)
		// 	params.set(key, options[key])
		// }
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(
			API_ACCOUNT_URL + "/list/acctype/cashbankAR?" + params,
			{ headers: httpHeaders }
		);
	}

	// getListGLAccount(queryParams: QueryParamsModel): Observable<QueryResultsModel>{
	// 	const httpHeaders = new HttpHeaders();
	// 	httpHeaders.set('Content-Type', 'application/json');
	// 	let params = new URLSearchParams();
	// 	params.set("param", JSON.stringify(queryParams));
	// 	return this.http.get<QueryResultsModel>(API_ACCOUNT_URL + '/list/glaccount?' + params,{ headers: httpHeaders });
	// }

	getListGLAccountAR(
		queryParams: QueryParamsModel
	): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(
			API_ACCOUNT_URL + "/list/glaccountAR?" + params,
			{ headers: httpHeaders }
		);
	}
	getListVoucherBill(
		queryParams: QueryParamsModel
	): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(
			API_AMORTIZATION + "/list/selectvoucherbill?" + params,
			{ headers: httpHeaders }
		);
	}

	getListGLAccountSODebit(
		queryParams: QueryParamsModel
	): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(
			API_ACCOUNT_URL + "/list/glaccountSODebit?" + params,
			{ headers: httpHeaders }
		);
	}
	getListGLAccountSOCredit(
		queryParams: QueryParamsModel
	): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(
			API_ACCOUNT_URL + "/list/glaccountSOCredit?" + params,
			{ headers: httpHeaders }
		);
	}

	getListGLAccountAP(
		queryParams: QueryParamsModel
	): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(
			API_ACCOUNT_URL + "/list/glaccountAP?" + params,
			{ headers: httpHeaders }
		);
	}

	getListExpenditures(
		queryParams: QueryParamsModel
	): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(
			API_ACCOUNT_URL + "/list/expenditures?" + params,
			{ headers: httpHeaders }
		);
	}

	getListAccountByType(id: string): Observable<any> {
		return this.http.get<any>(`${API_ACCOUNT_URL}/list/coa/${id}`);
	}

	getListByType(id: string): Observable<any> {
		return this.http.post<any>(`${API_ACCOUNT_URL}/list/selected/acctype`, {
			selected_acctype: id,
		});
	}

	generateAccountBalance(): Observable<AccountGroupModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.patch<AccountGroupModel>(`${API_ACCOUNT_URL}/edit-balance`, { headers: httpHeaders });
	}

	generateAccountDetails(): Observable<AccountGroupModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.patch<AccountGroupModel>(`${API_ACCOUNT_URL}/edit-details`, { headers: httpHeaders });
	}

	generateAccountParents(): Observable<AccountGroupModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.patch<AccountGroupModel>(`${API_ACCOUNT_URL}/edit-parent`, { headers: httpHeaders });
	}

	findAccountGroupById(_id: string): Observable<any> {
		return this.http.get<any>(`${API_ACCOUNT_URL}/${_id}`);
	}
	deleteAccountGroup(accountGroupId: string) {
		const url = `${API_ACCOUNT_URL}/${accountGroupId}`;
		return this.http.delete(url);
	}
	updateAccountGroup(accountGroup: AccountGroupModel) {
		const url = `${API_ACCOUNT_URL}/edit/${accountGroup._id}`;
		return this.http.patch(url, accountGroup);
	}
	createAccountGroup(
		accountGroup: AccountGroupModel
	): Observable<AccountGroupModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http.post<AccountGroupModel>(
			`${API_ACCOUNT_URL}/add`,
			accountGroup,
			{ headers: httpHeaders }
		);
	}
	getListAccountBank(queryParams: any): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(API_ACCOUNT_BANK_URL);
	}

	// Select Parent (START)
	getParent(input: string): Observable<any> {
		return this.http.get<any>(`${API_ACCOUNT_URL}/get/parent?input=${input}`);
	}
	// Select Parent (END)

	private handleError<T>(operation = "operation", result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	exportExcel() {
		return FileSaver.saveAs(`${API_EXCEL}`, "export-account.xlsx");
	}
}
