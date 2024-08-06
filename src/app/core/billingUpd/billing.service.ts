import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BillingModel } from './billing.model';
import { QueryResultsModelUpd } from '../_base/crud-upd';
import * as FileSaver from 'file-saver';
import { environment } from '../../../environments/environment';
import { QueryBillingModelUpd } from './querybilling.model';

const API_EXCEL = `${environment.baseAPI}/api/excel/billing/export`;
const API_BILLING_URL = `${environment.baseAPI}/api/billing`;
const API_EXCEL_HISTORY = `${environment.baseAPI}/api/excel/billing/history/export`;
const API_EXCEL_TOKEN = `${environment.baseAPI}/api/excel/billing/vatoken/export`

@Injectable({
	providedIn: 'root'
})

export class BillingService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListBilling(queryParams: QueryBillingModelUpd): Observable<QueryResultsModelUpd> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		// let params = new HttpParams({
		// 	fromObject: queryParams
		// });
		// @ts-ignore
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModelUpd>(API_BILLING_URL + '/list?' + params, { headers: httpHeaders });
	}



	getListBillingLog(queryParams: QueryBillingModelUpd): Observable<QueryResultsModelUpd> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		// let params = new HttpParams({
		// 	fromObject: queryParams
		// });
		// @ts-ignore
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModelUpd>(API_BILLING_URL + '/list/log?' + params, { headers: httpHeaders });
	}

	getListForPinalty(queryParams: QueryBillingModelUpd): Observable<QueryResultsModelUpd> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		// let params = new HttpParams({
		// 	fromObject: queryParams
		// });
		// @ts-ignore
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModelUpd>(API_BILLING_URL + '/list/pinalty?' + params, { headers: httpHeaders });
	}
	getPayment(no): Observable<QueryResultsModelUpd> {
		return this.http.get<QueryResultsModelUpd>(`${environment.baseAPI}/api/logaction/list-by?log_number=${no}&status=U`);
	}
	getBillingNumber(): Observable<QueryResultsModelUpd> {
		return this.http.get<QueryResultsModelUpd>(`${API_BILLING_URL}/generate/codeBilling`);
	}
	findBillingByParent(_id: string): Observable<QueryResultsModelUpd> {
		return this.http.get<QueryResultsModelUpd>(`${API_BILLING_URL}/parent/${_id}`);
	}
	getBillingPdfId(_id: string): Observable<QueryResultsModelUpd> {
		return this.http.get<QueryResultsModelUpd>(`${API_BILLING_URL}/create/${_id}`);
	}
	getBillingByID(_id: string): Observable<any> {
		return this.http.get<any>(`${API_BILLING_URL}/${_id}`);
	}
	deleteBilling(billingId: string) {
		const url = `${API_BILLING_URL}/delete/${billingId}`;
		return this.http.delete(url);
	}
	exportExcel() {
		return FileSaver.saveAs(`${API_EXCEL}`, "export-billing.xlsx");
	}
	exportExcelHistory() {
		return FileSaver.saveAs(`${API_EXCEL_HISTORY}`, "export-billing-history.xlsx");
	}
	exportExcelToken() {
		return FileSaver.saveAs(`${API_EXCEL_TOKEN}`, "download-billing.xlsx");
	}

	updateBilling(billing: BillingModel) {
		const url = `${API_BILLING_URL}/edit/${billing._id}`;
		return this.http.patch(url, billing);
	}
	createBilling(billing: BillingModel): Observable<BillingModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<BillingModel>(`${API_BILLING_URL}/add`, billing, { headers: httpHeaders });
	}

	postToMobile(billing) {
		const url = `${API_BILLING_URL}/ispost`;
		return this.http.patch(url, billing);
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}
}
