import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { QuotationModel } from './quotation.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryQuotationModel } from './queryquotation.model';

const API_BASE = `${environment.baseAPI}/api/purchase/quotation`;
const API_CSV = `${environment.baseAPI}/api/purchase/quotation/downloadxlxs`;


@Injectable({
	providedIn: 'root'
})
export class QuotationService {
	constructor(private http: HttpClient) {}
	getListQuotation(queryParams: QueryQuotationModel): Observable<QueryResultsModel>{
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

	getListSelQuotation(queryParams: QueryQuotationModel): Observable<QueryResultsModel>{
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

	generateQuotationCode(): Observable<QueryResultsModel>{
		const url = `${API_BASE}/generate`;
		return this.http.get<QueryResultsModel>(url);
	}

	//findQuotationById(_id: string): Observable<QuotationModel>{
	findQuotationById(_id: string): Observable<any>{
		//return this.http.get<QuotationModel>(`${API_BASE}/${_id}`);
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	deleteQuotation(quotationId: string) {
		const url = `${API_BASE}/delete/${quotationId}`;
		return this.http.delete(url);
	}

	deleteFlagQuotation(visitor: QuotationModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateQuotation(quotation: QuotationModel) {
		const url = `${API_BASE}/edit/${quotation._id}`;
		return this.http.patch(url, quotation);
	}

	createQuotation(quotation: QuotationModel): Observable<QuotationModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<QuotationModel>(`${API_BASE}/add`, quotation, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-quotation.xlsx");
	}

	printPurchaseRequestTemplate(id, vid){

		return this.http.get<any>(`${API_BASE}/print/${id}/${vid}`);
	}
}
