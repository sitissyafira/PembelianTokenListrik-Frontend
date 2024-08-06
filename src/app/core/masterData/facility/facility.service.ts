import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FacilityModel } from './facility.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryParamsModel, QueryResultsModel} from '../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryFacilityModel } from './queryfacility.model';

const API_BASE = `${environment.baseAPI}/api/facility`;
const API_CSV = `${environment.baseAPI}/api/excel/facility/export`;

@Injectable({
	providedIn: 'root'
})
export class FacilityService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListFacility(queryParams: QueryFacilityModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			search : queryParams.search,
			page : queryParams.page,
			limit : queryParams.limit
		}
		let params = new URLSearchParams();
		for (let key in options) {
			if (key === 'search' && !options[key]) continue
			params.set(key, options[key])

		}
		// params.set("param", JSON.stringify(queryParams));
		const url = `${API_BASE}/list?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getListFacilityNoParam(): Observable<QueryResultsModel> {
		const url = `${API_BASE}/list`;
		return this.http.get<QueryResultsModel>(url);
	}

	findFacilityById(_id: string): Observable<FacilityModel>{
		return this.http.get<FacilityModel>(`${API_BASE}/${_id}`);
	}

	findFacilityByType(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/list/type/${_id}`);
	}
	
	deleteFacility(facilityId: string) {
		const url = `${API_BASE}/delete/${facilityId}`;
		return this.http.delete(url);
	}

	deleteFacilityFlag(facility: FacilityModel) {
		const url = `${API_BASE}/deleteflag/${facility._id}`;
		return this.http.patch(url, facility);
	}

	updateFacility(facility: FacilityModel) {
		const url = `${API_BASE}/edit/${facility._id}`;
		return this.http.patch(url, facility);
	}
	createFacility(facility: FacilityModel): Observable<FacilityModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<FacilityModel>(`${API_BASE}/add`, facility, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-facility.xlsx");
	}
}
