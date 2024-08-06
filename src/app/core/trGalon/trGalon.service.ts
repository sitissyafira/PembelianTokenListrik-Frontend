import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { TrGalonModel } from './trGalon.model';
import { QueryResultsModel } from '../_base/crud';
import * as FileSaver from 'file-saver';
import { environment } from '../../../environments/environment';
import { QueryTrGalonModel } from './querytrGalon.model';

const API_EXCEL = `${environment.baseAPI}/api/excel/galon/export`;
const API_EXCEL_HISTORY = `${environment.baseAPI}/api/excel/galon/history/export`;
const API_EXCEL_TOKEN = `${environment.baseAPI}/api/excel/galon/vatoken/export`
const API_GALON_URL = `${environment.baseAPI}/api/galon/transaction`;

// const API_EXCEL = `${environment.baseAPI}/api/excel/billing/export`;
// const API_EXCEL_HISTORY = `${environment.baseAPI}/api/excel/billing/history/export`;
// const API_EXCEL_TOKEN = `${environment.baseAPI}/api/excel/billing/vatoken/export`
// const API_GALON_URL = `${environment.baseAPI}/api/billing`;

@Injectable({
	providedIn: 'root'
})

export class TrGalonService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListTrGalon(queryParams: QueryTrGalonModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		// let params = new HttpParams({
		// 	fromObject: queryParams
		// });
		// @ts-ignore
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}

		return this.http.get<QueryResultsModel>(API_GALON_URL + '/list/all/web?' + params, { headers: httpHeaders });
	}



	getListTrGalonLog(queryParams: QueryTrGalonModel): Observable<QueryResultsModel> {
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

		return this.http.get<QueryResultsModel>(API_GALON_URL + '/list/log?' + params, { headers: httpHeaders });
	}

	getListForPinalty(queryParams: QueryTrGalonModel): Observable<QueryResultsModel> {
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
		return this.http.get<QueryResultsModel>(API_GALON_URL + '/list/pinalty?' + params, { headers: httpHeaders });
	}
	findTrGalonByParent(_id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_GALON_URL} /parent/${_id} `);
	}
	getTrGalonPdfId(_id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_GALON_URL} /create/${_id} `);
	}
	getTrGalonByID(_id: string): Observable<any> {
		return this.http.get<any>(`${API_GALON_URL}/${_id}`);
	}
	getListAccountBankBilling(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		params.set("params", JSON.stringify(queryParams));
		return this.http.get<any>(API_GALON_URL + '/list/vacoabank?' + params, { headers: httpHeaders });
	}
	deleteTrGalon(trGalonId: string) {
		const url = `${API_GALON_URL}/delete/${trGalonId}`;
		return this.http.delete(url);
	}
	exportExcel() {
		return FileSaver.saveAs(`${API_EXCEL}`, "export-trGalon.xlsx");
	}
	exportExcelHistory() {
		return FileSaver.saveAs(`${API_EXCEL_HISTORY}`, "export-trGalon-history.xlsx");
	}
	exportExcelToken() {
		return FileSaver.saveAs(`${API_EXCEL_TOKEN}`, "download-trGalon.xlsx");
	}


	upload(file: File): Observable<HttpEvent<any>> {
		const formData: FormData = new FormData();

		formData.append('file', file);

		const req = new HttpRequest('POST', `${API_GALON_URL}/upload`, formData, {
			reportProgress: true,
			responseType: 'json'
		});

		return this.http.request(req);
	}

	getFiles(): Observable<any> {
		//return this.http.get(`${this.baseUrl}/uploads`);
		return this.http.get(`${API_GALON_URL}/upload/trGalon`);
	}

	// Update ISREAD
	updateIsRead(id) {
		let data = { data: "" }
		return this.http.patch(`${API_GALON_URL}/update/isread/${id}`, data);
	}

	updateTrGalon(trGalon: TrGalonModel) {
		const url = `${API_GALON_URL}/edit/${trGalon._id}`;
		return this.http.patch(url, trGalon);
	}
	createTrGalon(trGalon: TrGalonModel): Observable<TrGalonModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<TrGalonModel>(`${API_GALON_URL}/add`, trGalon, { headers: httpHeaders });
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
