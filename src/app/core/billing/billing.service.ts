import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BillingModel } from './billing.model';
import { QueryResultsModel } from '../_base/crud';
import * as FileSaver from 'file-saver';
import { environment } from '../../../environments/environment';
import { QueryBillingModel } from './querybilling.model';

const API_EXCEL = `${environment.baseAPI}/api/excel/billing/export`;
const API_EXCEL_HISTORY = `${environment.baseAPI}/api/excel/billing/history/export`;
const API_EXCEL_TOKEN = `${environment.baseAPI}/api/excel/billing/vatoken/export`
const API_BILLING_URL = `${environment.baseAPI}/api/billing`;

@Injectable({
	providedIn: 'root'
})

export class BillingService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListBilling(queryParams: QueryBillingModel): Observable<QueryResultsModel> {
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
		return this.http.get<QueryResultsModel>(API_BILLING_URL + '/list?' + params, { headers: httpHeaders });
	}



	getListBillingLog(queryParams: QueryBillingModel): Observable<QueryResultsModel> {
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
		return this.http.get<QueryResultsModel>(API_BILLING_URL + '/list/log?' + params, { headers: httpHeaders });
	}

	getListForPinalty(queryParams: QueryBillingModel): Observable<QueryResultsModel> {
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
		return this.http.get<QueryResultsModel>(API_BILLING_URL + '/list/pinalty?' + params, { headers: httpHeaders });
	}
	
	getPayment(no): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${environment.baseAPI}/api/logaction/list-by?log_number=${no}&status=U`);
	}
	// getBillingNumber(billDate: string): Observable<QueryResultsModel>
	// 	return this.http.get<QueryResultsModel>(`${API_BILLING_URL}/generate/codeBilling?billDate=${billDate}`);
	// }
	findBillingByParent(_id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_BILLING_URL}/parent/${_id}`);
	}
	getBillingPdfId(_id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_BILLING_URL}/create/${_id}`);
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

	/** Generate Billing Number From Back-End */
	getBillingNumber(queryParams): Observable<any> {
		const url = `${API_BILLING_URL}/generate/codeBilling?`
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}

		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}

		return this.http.get<any>(url + params, { headers: httpHeaders });
	}

	/** ====================================== Payment Billing ====================================== */
	// Reject Payment
	rejectPayment(dataSend) {
		const url = `${API_BILLING_URL}/rejectPayment/${dataSend._id}`;
		return this.http.patch(url, dataSend);
	}

	// Get Attachment
	getAttachment(_id: string): Observable<any> {
		return this.http.get<any>(`${API_BILLING_URL}/getAttachment/${_id}`);
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
