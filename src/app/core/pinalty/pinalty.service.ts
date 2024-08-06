import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PinaltyModel } from './pinalty.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';
import {QueryParamsModel} from '../_base/crud/models/query-models/query-params.model';
import * as FileSaver from 'file-saver';

const API_PINALTY_URL = `${environment.baseAPI}/api/pinalty`;
const API_EXCEL = `${environment.baseAPI}/api/excel/pinalty/export`;

@Injectable({
	providedIn: 'root'
})

export class PinaltyService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListPinalty(queryParams: QueryParamsModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_PINALTY_URL}`);
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		// let params = new HttpParams({
		// 	fromObject: queryParams
		// });
		// @ts-ignore
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_PINALTY_URL + '/list?' + params,{ headers: httpHeaders });
	}
	findPinaltyById(_id: string): Observable<PinaltyModel>{
		return this.http.get<PinaltyModel>(`${API_PINALTY_URL}/${_id}`);
	}
	deletePinalty(pinaltyId: string) {
		const url = `${API_PINALTY_URL}/delete/${pinaltyId}`;
		return this.http.delete(url);
	}
	updatePinalty(pinalty: PinaltyModel) {
		const url = `${API_PINALTY_URL}/edit/${pinalty._id}`;
		return this.http.patch(url, pinalty);
	}
	createPinalty(pinalty: PinaltyModel): Observable<PinaltyModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PinaltyModel>(`${API_PINALTY_URL}/add`, pinalty, { headers: httpHeaders});
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_EXCEL}`, "export-pinalty.xlsx");
	}

	
	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}
}
