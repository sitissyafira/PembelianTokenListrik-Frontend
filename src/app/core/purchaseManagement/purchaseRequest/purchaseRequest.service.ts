import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PurchaseRequestModel } from './purchaseRequest.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryPurchaseRequestModel } from './querypurchaseRequest.model';

const API_BASE = `${environment.baseAPI}/api/purchase/request`;
const API_CSV = `${environment.baseAPI}/api/purchase/request/downloadxlxs`;
const API_PDF = `${environment.baseAPI}/api/purchase/request/export/pdf`;


@Injectable({
	providedIn: 'root'
})
export class PurchaseRequestService {
	constructor(private http: HttpClient) {}
	getListPurchaseRequest(queryParams: QueryPurchaseRequestModel): Observable<QueryResultsModel>{
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

	getListPurchaseRequest2(queryParams: QueryPurchaseRequestModel): Observable<QueryResultsModel>{
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
		const url = `${API_BASE}/all2?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getListPOPurchaseRequest(queryParams: QueryPurchaseRequestModel): Observable<QueryResultsModel>{
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
		const url = `${API_BASE}/all/po?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getListPOPurchaseRequestTrue(queryParams: QueryPurchaseRequestModel): Observable<QueryResultsModel>{
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
		const url = `${API_BASE}/all/potrue?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getListPOPurchaseRequest2(queryParams: QueryPurchaseRequestModel): Observable<QueryResultsModel>{
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
		const url = `${API_BASE}/all/po2?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getListSOPurchaseRequest(queryParams: QueryPurchaseRequestModel): Observable<QueryResultsModel>{
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
		const url = `${API_BASE}/all/so?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	generatePRCode(): Observable<QueryResultsModel>{
		const url = `${API_BASE}/generate`;
		return this.http.get<QueryResultsModel>(url);
	}

	findPurchaseRequestById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	deletePurchaseRequest(purchaseRequestId: string) {
		const url = `${API_BASE}/delete/${purchaseRequestId}`;
		return this.http.delete(url);
	}

	deleteFlagPurchaseRequest(visitor: PurchaseRequestModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updatePurchaseRequest(purchaseRequest: PurchaseRequestModel) {
		const url = `${API_BASE}/edit/${purchaseRequest._id}`;
		return this.http.patch(url, purchaseRequest);
	}

	createPurchaseRequest(purchaseRequest: PurchaseRequestModel): Observable<PurchaseRequestModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PurchaseRequestModel>(`${API_BASE}/add`, purchaseRequest, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-purchaseRequest.xlsx");
	}

	exportPDF(id){
		return FileSaver.saveAs(`${API_PDF}/${id}`, "export-purchaseRequest.pdf");
	}
}
