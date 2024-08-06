import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { TopUpModel } from './topup.model';
import { QueryResultsModel } from '../_base/crud';
import * as FileSaver from 'file-saver';
import { environment } from '../../../environments/environment';
import { QueryTopUpModel } from './querytopup.model';

const API_EXCEL = `${environment.baseAPI}/api/excel/topup/export`;
const API_BILLING_URL = `${environment.baseAPI}/api/topup`;


// start metode pembayaran
const API_TOKEN = `${environment.baseAPI}/api/tokenmaster`;
const API_TRANSAKSI = `${environment.baseAPI}/api/trantopup`;
// end metode pembayaran


@Injectable({
	providedIn: 'root'
})

export class TopUpService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListTopUp(queryParams: QueryTopUpModel): Observable<QueryResultsModel> {
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



	getListTopUpLog(queryParams: QueryTopUpModel): Observable<QueryResultsModel> {
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

	getListForPinalty(queryParams: QueryTopUpModel): Observable<QueryResultsModel> {
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

	// unit token start
	getDataOrderan(queryParams: any): Observable<QueryResultsModel> {
		return this.http.get<any>(`${API_TOKEN}/list/all`);
	}
	findOrderanById(_id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_TOKEN}/rttoken/${_id}`);
	}
	getCodeTransaksi(): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_TRANSAKSI}/get/cdtrans`);
	}
	getAllUnit(queryParams: any): Observable<QueryResultsModel> {
		return this.http.get<any>(`${API_TRANSAKSI}/get/unit`);
	}
	getMtdPembayaran(queryParams: any): Observable<QueryResultsModel> {
		return this.http.get<any>(`${API_TRANSAKSI}/get/paymtd`);
	}
	getBankTransfer(queryParams: any): Observable<QueryResultsModel> {
		return this.http.get<any>(`${API_TRANSAKSI}/get/banklist`);
	}
	createTransaksiToken(topup: any): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<any>(`${API_TRANSAKSI}/create`, topup, { headers: httpHeaders });
	}
	getDetailTransaksi(_id: string): Observable<any> {
		return this.http.get<any>(`${API_TRANSAKSI}/trdetail/${_id}`);
	}
	// unit token end

	getTopUpNumber(): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_BILLING_URL}/generate/codeTopUp`);
	}
	findTopUpByParent(_id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_BILLING_URL}/parent/${_id}`);
	}
	getTopUpPdfId(_id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_BILLING_URL}/create/${_id}`);
	}
	getTopUpByID(_id: string): Observable<any> {
		return this.http.get<any>(`${API_BILLING_URL}/${_id}`);
	}
	deleteTopUp(topupId: string) {
		const url = `${API_BILLING_URL}/delete/${topupId}`;
		return this.http.delete(url);
	}
	exportExcel() {
		return FileSaver.saveAs(`${API_EXCEL}`, "export-topup.xlsx");
	}

	updateTopUp(topup: TopUpModel) {
		const url = `${API_BILLING_URL}/edit/${topup._id}`;
		return this.http.patch(url, topup);
	}
	createTopUp(topup: TopUpModel): Observable<TopUpModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<TopUpModel>(`${API_BILLING_URL}/add`, topup, { headers: httpHeaders });
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
