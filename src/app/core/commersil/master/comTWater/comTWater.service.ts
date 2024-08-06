import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ComTWaterModel } from './comTWater.model';
import { environment } from '../../../../../environments/environment';
import { QueryResultsModel} from '../../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryComTWaterModel } from './querycomTWater.model';

const API_BASE = `${environment.baseAPI}/api/commersil/twater`;

@Injectable({
	providedIn: 'root'
})
export class ComTWaterService {
	constructor(private http: HttpClient) {}
	getListComTWater(queryParams: QueryComTWaterModel): Observable<QueryResultsModel>{
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
	
	findComTWaterById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}

	findComTWaterByUnitId(Unitid: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_BASE}/unit/${Unitid}`);
	}
	

	deleteComTWater(comTWaterId: string) {
		const url = `${API_BASE}/delete/${comTWaterId}`;
		return this.http.delete(url);
	}

	deleteFlagComTWater(visitor: ComTWaterModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateComTWater(comTWater: ComTWaterModel) {
		const url = `${API_BASE}/edit/${comTWater._id}`;
		return this.http.patch(url, comTWater);
	}
	
	createComTWater(comTWater: ComTWaterModel): Observable<ComTWaterModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ComTWaterModel>(`${API_BASE}/add`, comTWater, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-comTWater.xlsx");
	}
}
