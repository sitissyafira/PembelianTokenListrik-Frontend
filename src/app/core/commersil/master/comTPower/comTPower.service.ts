import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ComTPowerModel } from './comTPower.model';
import { environment } from '../../../../../environments/environment';
import { QueryResultsModel} from '../../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryComTPowerModel } from './querycomTPower.model';

const API_BASE = `${environment.baseAPI}/api/commersil/tpower`;

@Injectable({
	providedIn: 'root'
})
export class ComTPowerService {
	constructor(private http: HttpClient) {}
	getListComTPower(queryParams: QueryComTPowerModel): Observable<QueryResultsModel>{
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
	
	findComTPowerById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}


	findComTPowerByUnitId(Unitid: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_BASE}/unit/${Unitid}`);
	}
	

	deleteComTPower(comTPowerId: string) {
		const url = `${API_BASE}/delete/${comTPowerId}`;
		return this.http.delete(url);
	}

	deleteFlagComTPower(visitor: ComTPowerModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateComTPower(comTPower: ComTPowerModel) {
		const url = `${API_BASE}/edit/${comTPower._id}`;
		return this.http.patch(url, comTPower);
	}
	
	createComTPower(comTPower: ComTPowerModel): Observable<ComTPowerModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ComTPowerModel>(`${API_BASE}/add`, comTPower, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-comTPower.xlsx");
	}
}
