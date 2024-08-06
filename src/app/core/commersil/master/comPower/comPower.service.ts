import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ComPowerModel } from './comPower.model';
import { environment } from '../../../../../environments/environment';
import { QueryResultsModel} from '../../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryComPowerModel } from './querycomPower.model';

const API_BASE = `${environment.baseAPI}/api/commersil/mpower`;

@Injectable({
	providedIn: 'root'
})
export class ComPowerService {
	constructor(private http: HttpClient) {}
	getListComPower(queryParams: QueryComPowerModel): Observable<QueryResultsModel>{
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

	getListComPowerForTransaction(queryParams: QueryComPowerModel): Observable<QueryResultsModel>{
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
	
	findComPowerById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	

	deleteComPower(comPowerId: string) {
		const url = `${API_BASE}/delete/${comPowerId}`;
		return this.http.delete(url);
	}

	deleteFlagComPower(visitor: ComPowerModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateComPower(comPower: ComPowerModel) {
		const url = `${API_BASE}/edit/${comPower._id}`;
		return this.http.patch(url, comPower);
	}
	
	createComPower(comPower: ComPowerModel): Observable<ComPowerModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ComPowerModel>(`${API_BASE}/add`, comPower, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export - Power Meter Commercial.xlsx");
	}
}
