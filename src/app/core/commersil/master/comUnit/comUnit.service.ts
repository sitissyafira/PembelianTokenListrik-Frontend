import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ComUnitModel } from './comUnit.model';
import { environment } from '../../../../../environments/environment';
import { QueryResultsModel } from '../../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryComUnitModel } from './querycomUnit.model';

const API_BASE = `${environment.baseAPI}/api/commersil/munit`;

@Injectable({
	providedIn: 'root'
})
export class ComUnitService {
	constructor(private http: HttpClient) { }
	getListComUnit(queryParams: QueryComUnitModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			search: queryParams.search,
			pageNumber: queryParams.pageNumber,
			limit: queryParams.limit
		}
		let params = new URLSearchParams();
		for (let key in options) {
			if (key === 'search' && !options[key]) continue
			params.set(key, options[key])

		}
		const url = `${API_BASE}/list?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}


	getListUnitForPower(queryParams: QueryComUnitModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			search: queryParams.search,
			pageNumber: queryParams.pageNumber,
			limit: queryParams.limit
		}
		let params = new URLSearchParams();
		for (let key in options) {
			if (key === 'search' && !options[key]) continue
			params.set(key, options[key])

		}
		const url = `${API_BASE}/list/powermeter?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getListUnitForWater(queryParams: QueryComUnitModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			search: queryParams.search,
			pageNumber: queryParams.pageNumber,
			limit: queryParams.limit
		}
		let params = new URLSearchParams();
		for (let key in options) {
			if (key === 'search' && !options[key]) continue
			params.set(key, options[key])

		}
		const url = `${API_BASE}/list/watermeter?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	findComUnitById(_id: string): Observable<any> {
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}


	deleteComUnit(comUnitId: string) {
		const url = `${API_BASE}/delete/${comUnitId}`;
		return this.http.delete(url);
	}

	deleteFlagComUnit(visitor: ComUnitModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateComUnit(comUnit: ComUnitModel) {
		const url = `${API_BASE}/edit/${comUnit._id}`;
		return this.http.patch(url, comUnit);
	}

	createComUnit(comUnit: ComUnitModel): Observable<ComUnitModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ComUnitModel>(`${API_BASE}/add`, comUnit, { headers: httpHeaders });
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	exportExcel() {
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-comUnit.xlsx");
	}
}
