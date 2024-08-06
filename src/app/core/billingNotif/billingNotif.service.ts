import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { billingNotifModel } from "./billingNotif.model";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { QueryParamsModel, QueryResultsModel } from "../_base/crud";

import * as FileSaver from "file-saver";
import { QuerybillingNotifModel } from "./queryag.model";

const BASE_API = `${environment.baseAPI}/api/billingnotif`;
const API_EXCEL = `${environment.baseAPI}/api/excel/billingNotif/export`;
const API_AMORTIZATION = `${environment.baseAPI}/api/jouamor`
const API_ACCOUNT_BANK_URL = `${environment.baseAPI}/api/acct/list-bank`;

@Injectable({
	providedIn: "root",
})
export class billingNotifService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListbillingNotif(
		queryParams: QuerybillingNotifModel
	): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		let options = {
			// search: queryParams.search,
			sortOrder: queryParams.sortOrder,
			sortField: queryParams.sortField,
			pageNumber: queryParams.page,
			limit: queryParams.limit,
			noId: queryParams.noId,
			type_notif: queryParams.type_notif
		};

		let params = new URLSearchParams();
		for (let key in options) {
			// Skip if search is empty
			// if (key === "search" && !options[key]) continue;
			if(options[key] != undefined){
			params.set(key, options[key]);
			}
		}

		const url = `${BASE_API}/get?${params}`;

		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}
	getListUnit(
		queryParams: any
	): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		let options = {
			unit: queryParams.search,
		};

		let params = new URLSearchParams();
		for (let key in options) {
			// Skip if search is empty
			if (key === "search" && !options[key]) continue;
			params.set(key, options[key]);
		}

		const url = `${BASE_API}/get/list/unit?${params}`;

		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	findbillingNotifById(_id: string): Observable<any> {
		return this.http.get<any>(`${BASE_API}/get/${_id}`);
	}
	deletebillingNotif(billingNotifId: string) {
		const url = `${BASE_API}/delete/${billingNotifId}`;
		return this.http.delete(url);
	}
	updatebillingNotif(billingNotif: billingNotifModel) {
		const url = `${BASE_API}/update/${billingNotif._id}`;
		return this.http.patch(url, billingNotif);
	}
	findUnit(query): Observable<any> {
		// const httpHeaders = new HttpHeaders();
		// httpHeaders.set("Content-Type", "application/json");
		// return this.http.get<any>(
		// 	`${BASE_API}/get/unit`,
		// 	query,
			
		// );
		const url = `${BASE_API}/get/unit`;
		return this.http.post(url, query);

	}
	createbillingNotif(
		billingNotif: billingNotifModel
	): Observable<billingNotifModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http.post<billingNotifModel>(
			`${BASE_API}/add`,
			billingNotif,
			{ headers: httpHeaders }
		);
	}
	private handleError<T>(operation = "operation", result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	exportExcel() {
		return FileSaver.saveAs(`${API_EXCEL}`, "export-billingNotif.xlsx");
	}
}
