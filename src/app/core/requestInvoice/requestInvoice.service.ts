import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RequestInvoiceModel } from './requestInvoice.model';
import { environment } from '../../../environments/environment';
import { QueryResultsModel} from '../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryRequestInvoiceModel } from './queryrequestInvoice.model';

const API_BASE = `${environment.baseAPI}/api/requestInvoice`;


@Injectable({
	providedIn: 'root'
})
export class RequestInvoiceService {
	constructor(private http: HttpClient) {}
	getListRequestInvoice(queryParams: QueryRequestInvoiceModel): Observable<QueryResultsModel>{
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
		const url = `${API_BASE}/list?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}



	getListRequestInvoiceOpen(queryParams: QueryRequestInvoiceModel): Observable<QueryResultsModel>{
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
		const url = `${API_BASE}/list/open?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}
	
	findRequestInvoiceById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	

	deleteRequestInvoice(requestInvoiceId: string) {
		const url = `${API_BASE}/delete/${requestInvoiceId}`;
		return this.http.delete(url);
	}

	deleteFlagRequestInvoice(visitor: RequestInvoiceModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateRequestInvoice(requestInvoice: RequestInvoiceModel) {
		const url = `${API_BASE}/edit/${requestInvoice._id}`;
		return this.http.patch(url, requestInvoice);
	}
	
	createRequestInvoice(requestInvoice: RequestInvoiceModel): Observable<RequestInvoiceModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<RequestInvoiceModel>(`${API_BASE}/add`, requestInvoice, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-requestInvoice.xlsx");
	}
}
