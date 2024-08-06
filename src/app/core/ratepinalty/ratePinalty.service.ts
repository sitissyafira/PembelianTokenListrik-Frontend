import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RatePinaltyModel } from './ratePinalty.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryPinaltyModel } from './querypinalty.model';


const API_FLOOR_URL = `${environment.baseAPI}/api/pnltyrate`;
const API_CSV = `${environment.baseAPI}/api/excel/pnltyrate/export`;




@Injectable({
	providedIn: 'root'
})
export class RatePinaltyService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListRatePinalty(queryParams: QueryPinaltyModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_FLOOR_URL + '?' + params,{ headers: httpHeaders });
	}

	
	findRatePinaltyById(_id: string): Observable<RatePinaltyModel>{
		return this.http.get<RatePinaltyModel>(`${API_FLOOR_URL}/${_id}`);
	}
	deleteRatePinalty(ratePinaltyId: string) {
		const url = `${API_FLOOR_URL}/${ratePinaltyId}`;
		return this.http.delete(url);
	}
	updateRatePinalty(ratePinalty: RatePinaltyModel) {
		const url = `${API_FLOOR_URL}/${ratePinalty._id}`;
		return this.http.patch(url, ratePinalty);
	}
	createRatePinalty(ratePinalty: RatePinaltyModel): Observable<RatePinaltyModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<RatePinaltyModel>(`${API_FLOOR_URL}`, ratePinalty, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-ratePinalty.xlsx");
	}
}
