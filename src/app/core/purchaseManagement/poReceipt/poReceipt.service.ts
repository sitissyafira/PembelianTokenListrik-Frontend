import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PoReceiptModel } from './poReceipt.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryPoReceiptModel } from './querypoReceipt.model';

const API_BASE = `${environment.baseAPI}/api/purchase/receipt`;
const API_CSV = `${environment.baseAPI}/api/purchase/receipt/downloadxlxs`;
const API_PDF = `${environment.baseAPI}/api/purchase/receipt/downloadxlxs`;


@Injectable({
	providedIn: 'root'
})
export class PoReceiptService {
	constructor(private http: HttpClient) {}
	getListPoReceipt(queryParams: QueryPoReceiptModel): Observable<QueryResultsModel>{
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

	getListPoReceiptNumber(queryParams: QueryPoReceiptModel): Observable<QueryResultsModel>{
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
		const url = `${API_BASE}/allnumber?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}
	
	getListQuotationPoReceipt(queryParams: QueryPoReceiptModel): Observable<QueryResultsModel>{
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
	
	generatePORCode(): Observable<QueryResultsModel>{
		const url = `${API_BASE}/generate`;
		return this.http.get<QueryResultsModel>(url);
	}

	findPoReceiptById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	deletePoReceipt(poReceiptId: string) {
		const url = `${API_BASE}/delete/${poReceiptId}`;
		return this.http.delete(url);
	}

	deleteFlagPoReceipt(visitor: PoReceiptModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updatePoReceipt(id, poReceipt: PoReceiptModel) {
		const url = `${API_BASE}/edit/${id}`;
		return this.http.patch(url, poReceipt);
	}
	
	createPoReceipt(poReceipt: PoReceiptModel): Observable<PoReceiptModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PoReceiptModel>(`${API_BASE}/add`, poReceipt, { headers: httpHeaders});
	}

	calculateHistoryIn(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/calculateInPOR/po/${_id}`);
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	
	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-poReceipt.xlsx");
	}
	exportPDF(){
		return FileSaver.saveAs(`${API_PDF}`, "export-poReceipt.pdf");
	}
}
