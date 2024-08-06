import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PurchaseOrderModel } from './purchaseOrder.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryPurchaseOrderModel } from './querypurchaseOrder.model';

const API_BASE = `${environment.baseAPI}/api/purchase/order`;
const API_CSV = `${environment.baseAPI}/api/purchase/order/downloadxlxs`;
const API_PDF = `${environment.baseAPI}/api/purchase/order/downloadxlxs`;


@Injectable({
	providedIn: 'root'
})
export class PurchaseOrderService {
	constructor(private http: HttpClient) {}
	getListPurchaseOrder(queryParams: QueryPurchaseOrderModel): Observable<QueryResultsModel>{
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

	getListPOCode(queryParams: QueryPurchaseOrderModel): Observable<QueryResultsModel>{
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
	
	getListQuotationPurchaseOrder(queryParams: QueryPurchaseOrderModel): Observable<QueryResultsModel>{
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

	findPurchaseOrderById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	deletePurchaseOrder(purchaseOrderId: string) {
		const url = `${API_BASE}/delete/${purchaseOrderId}`;
		return this.http.delete(url);
	}

	deleteFlagPurchaseOrder(visitor: PurchaseOrderModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updatePurchaseOrder(purchaseOrder: PurchaseOrderModel) {
		const url = `${API_BASE}/edit/${purchaseOrder._id}`;
		return this.http.patch(url, purchaseOrder);
	}
	
	createPurchaseOrder(purchaseOrder: PurchaseOrderModel): Observable<PurchaseOrderModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PurchaseOrderModel>(`${API_BASE}/add`, purchaseOrder, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	
	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-purchaseOrder.xlsx");
	}
	exportPDF(){
		return FileSaver.saveAs(`${API_PDF}`, "export-purchaseOrder.pdf");
	}
}
