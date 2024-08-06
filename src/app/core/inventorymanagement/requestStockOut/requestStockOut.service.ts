import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RequestStockOutModel } from './requestStockOut.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryRequestStockOutModel } from './queryrequestStockOut.model';

const API_BASE = `${environment.baseAPI}/api/inventorymanagement/rso`;


@Injectable({
	providedIn: 'root'
})
export class RequestStockOutService {
	constructor(private http: HttpClient) {}
	getListRequestStockOut(queryParams: QueryRequestStockOutModel): Observable<QueryResultsModel>{
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



	getListRequestStockOutTrue(queryParams: QueryRequestStockOutModel): Observable<QueryResultsModel>{
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
		const url = `${API_BASE}/list/true?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}
	
	findRequestStockOutById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	

	deleteRequestStockOut(requestStockOutId: string) {
		const url = `${API_BASE}/delete/${requestStockOutId}`;
		return this.http.delete(url);
	}

	deleteFlagRequestStockOut(visitor: RequestStockOutModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateRequestStockOut(requestStockOut: RequestStockOutModel) {
		const url = `${API_BASE}/edit/${requestStockOut._id}`;
		return this.http.patch(url, requestStockOut);
	}
	
	createRequestStockOut(requestStockOut: RequestStockOutModel): Observable<RequestStockOutModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<RequestStockOutModel>(`${API_BASE}/add`, requestStockOut, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}


	generateCode(): Observable<QueryResultsModel>{
		const url = `${API_BASE}/code/generate`;
		return this.http.get<QueryResultsModel>(url);
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-requestStockOut.xlsx");
	}
}
