import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PettyCastModel } from './pettyCast.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryPettyCastModel } from './querypettyCast.model';

const API_BASE = `${environment.baseAPI}/api/purchase/pettycash`;

@Injectable({
	providedIn: 'root'
})


export class PettyCastService {
	constructor(private http: HttpClient) {}
	getListPettyCast(queryParams: QueryPettyCastModel): Observable<QueryResultsModel>{
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
	findPettyCastById(_id: string): Observable<PettyCastModel>{
		return this.http.get<PettyCastModel>(`${API_BASE}/${_id}`);
	}
	deletePettyCast(pettyCastId: string) {
		const url = `${API_BASE}/delete/${pettyCastId}`;
		return this.http.delete(url);
	}
	deleteFlagPettyCast(visitor: PettyCastModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}
	updatePettyCast(pettyCast: PettyCastModel) {
		const url = `${API_BASE}/edit/${pettyCast._id}`;
		return this.http.patch(url, pettyCast);
	}
	createPettyCast(pettyCast: PettyCastModel): Observable<PettyCastModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PettyCastModel>(`${API_BASE}/add`, pettyCast, { headers: httpHeaders});
	}
	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}


	generateCodePettyCash(): Observable<QueryResultsModel>{
		const url = `${API_BASE}/generate`;
		return this.http.get<QueryResultsModel>(url);
	}


	// exportExcel(){
	// 	return FileSaver.saveAs(`${API_CSV}`, "export-pettyCast.xlsx");
	// }
}
