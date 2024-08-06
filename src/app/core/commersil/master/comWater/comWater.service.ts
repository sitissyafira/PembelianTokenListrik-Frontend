import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ComWaterModel } from './comWater.model';
import { environment } from '../../../../../environments/environment';
import { QueryResultsModel} from '../../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryComWaterModel } from './querycomWater.model';

const API_BASE = `${environment.baseAPI}/api/commersil/mwater`;

@Injectable({
	providedIn: 'root'
})
export class ComWaterService {
	constructor(private http: HttpClient) {}
	getListComWater(queryParams: QueryComWaterModel): Observable<QueryResultsModel>{
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

	getListComWaterForTransaction(queryParams: QueryComWaterModel): Observable<QueryResultsModel>{
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
		const url = `${API_BASE}/list/transaction?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}
	
	findComWaterById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	

	deleteComWater(comWaterId: string) {
		const url = `${API_BASE}/delete/${comWaterId}`;
		return this.http.delete(url);
	}

	deleteFlagComWater(visitor: ComWaterModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateComWater(comWater: ComWaterModel) {
		const url = `${API_BASE}/edit/${comWater._id}`;
		return this.http.patch(url, comWater);
	}
	
	createComWater(comWater: ComWaterModel): Observable<ComWaterModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ComWaterModel>(`${API_BASE}/add`, comWater, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export - Water Meter Commercial.xlsx");
	}
}
