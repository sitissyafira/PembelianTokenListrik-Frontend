import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PaymentPoModel } from './paymentPo.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryPaymentPoModel } from './querypaymentPo.model';

const API_BASE = `${environment.baseAPI}/api/purchase/poPayment`;
const API_CSV = `${environment.baseAPI}/api/purchase/poPayment/downloadxlxs`;
const API_PDF = `${environment.baseAPI}/api/purchase/poPayment/downloadxlxs`;


@Injectable({
	providedIn: 'root'
})
export class PaymentPoService {
	constructor(private http: HttpClient) {}
	getListPaymentPo(queryParams: QueryPaymentPoModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			search : queryParams.search,
			pageNumber : queryParams.pageNumber,
			limit : queryParams.limit
		}
		let params = new URLSearchParams();
		for (let key in options) {
			if (key === 'search' && !options[key]) continue
			params.set(key, options[key])

		}
		const url = `${API_BASE}/all?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getListPOCode(queryParams: QueryPaymentPoModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			search : queryParams.search,
			pageNumber : queryParams.pageNumber,
			limit : queryParams.limit
		}
		let params = new URLSearchParams();
		for (let key in options) {
			if (key === 'search' && !options[key]) continue
			params.set(key, options[key])

		}
		const url = `${API_BASE}//list/allcode?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}
	
	getListQuotationPaymentPo(queryParams: QueryPaymentPoModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			search : queryParams.search,
			pageNumber : queryParams.pageNumber,
			limit : queryParams.limit
		}
		let params = new URLSearchParams();
		for (let key in options) {
			if (key === 'search' && !options[key]) continue
			params.set(key, options[key])

		}
		const url = `${API_BASE}/all/quo?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}
	
	generatePRCode(): Observable<QueryResultsModel>{
		const url = `${API_BASE}/generate`;
		return this.http.get<QueryResultsModel>(url);
	}

	findPaymentPoById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	deletePaymentPo(paymentPoId: string) {
		const url = `${API_BASE}/delete/${paymentPoId}`;
		return this.http.delete(url);
	}

	deleteFlagPaymentPo(visitor: PaymentPoModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updatePaymentPo(paymentPo: PaymentPoModel) {
		const url = `${API_BASE}/edit/${paymentPo._id}`;
		return this.http.patch(url, paymentPo);
	}
	
	createPaymentPo(paymentPo: PaymentPoModel): Observable<PaymentPoModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PaymentPoModel>(`${API_BASE}/add`, paymentPo, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	
	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-paymentPo.xlsx");
	}
	exportPDF(){
		return FileSaver.saveAs(`${API_PDF}`, "export-paymentPo.pdf");
	}
}
