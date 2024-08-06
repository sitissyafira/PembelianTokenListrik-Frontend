import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { VoidBillModel } from './voidBill.model';
import { QueryResultsModel } from '../../_base/crud';
import { QueryVoidBillModel } from './queryvoidBill.model';
import * as FileSaver from 'file-saver';
import { environment } from '../../../../environments/environment';

const API_VoidBill_URL = `${environment.baseAPI}/api/voidBill`;
const API_EXCEL = `${environment.baseAPI}/api/excel/voidBill/export`;
const API_BASE = `${environment.baseAPI}/api/voidBill`;

@Injectable({
	providedIn: 'root'
})
export class VoidBillService {
	constructor(private http: HttpClient) { }
	// get list VoidBill group
	getListVoidBill(queryParams: any): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}

		// params.set("param", JSON.stringify(queryParams));
		const url = `${API_BASE}/listVoidBill?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getAllNum(queryParams: any): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<any>(`${API_BASE}/listNum?${params}`, { headers: httpHeaders });
	}

	getListFalseVoidBill(queryParams: QueryVoidBillModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_VoidBill_URL + '/falselist?' + params, { headers: httpHeaders });
	}
	deleteVoidBill(voidBillId: string) {
		const url = `${API_VoidBill_URL}/delete/${voidBillId}`;
		return this.http.delete(url);
	}
	exportExcel() {
		return FileSaver.saveAs(`${API_EXCEL}`, "export-voidBill.xlsx");
	}
	updateVoidBill(voidBill: VoidBillModel) {
		const url = `${API_VoidBill_URL}/edit/${voidBill._id}`;
		return this.http.patch(url, voidBill);
	}
	createVoidBill(voidBill: VoidBillModel): Observable<VoidBillModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<VoidBillModel>(`${API_VoidBill_URL}/add`, voidBill, { headers: httpHeaders });
	}
	findVoidBillByParent(id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_VoidBill_URL}/parent/${id}`);
	}


	findVoidBillById(id: any): Observable<any> {
		return this.http.get<any>(`${API_VoidBill_URL}/${id}`);
	}

	viewVoidBillById(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<any>(`${API_BASE}/viewVoidBill?${params}`);
	}

	downloadVoidBillById(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<any>(`${API_BASE}/downloadPDF?${params}`);
	}

	generateVoidBillCode(): Observable<QueryResultsModel> {
		const url = `${API_VoidBill_URL}/generate/voidBill`;
		return this.http.get<QueryResultsModel>(url);
	}

	generateARCard(): Observable<VoidBillModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<VoidBillModel>(`${API_BASE}/generate`, { headers: httpHeaders });
	}

	findVoidBillByIdPlain(id: any): Observable<any> {
		return this.http.get<any>(`${API_VoidBill_URL}/${id}`);
	}

	// ========================= VOID BILLING # START =========================
	deleteBillVoid(dataSend) {
		const formData: FormData = new FormData();

		if (dataSend.attachment.length) {
			for (let i = 0; i < dataSend.attachment.length; i++) {
				formData.append("attachment", dataSend.attachment[i]);
			}
		} else {
			formData.append("attachment", null);
		}

		formData.append('reasonDel', dataSend.reasonDel);
		formData.append('updateBy', dataSend.updateBy);
		formData.append('descriptionDelete', dataSend.descriptionDelete);

		const url = `${API_BASE}/delete/${dataSend._id}`;


		const req = new HttpRequest('DELETE', `${url}`, formData, {
			reportProgress: true,
			responseType: 'json'
		});

		return this.http.request(req);
	}
	// ========================= VOID BILLING # END =========================

	/**
	 * Export Sample Import
	 * @returns 
	 */
	exportExample(filter) {
		return FileSaver.saveAs(`${API_BASE}/export/sample?startDate=${filter.startDate}&endDate=${filter.endDate}&unit=${filter.unit}&statusValue=${filter.statusValue}`, "export-voidbill-sample.xlsx");
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
