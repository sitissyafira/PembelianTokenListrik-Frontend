import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { LogactionModel } from './logaction.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryLogactionModel } from './querylogaction.model';

const API_FLOOR_URL = `${environment.baseAPI}/api/logaction`;
const API_CSV =  `${environment.baseAPI}/api/excel/export/logaction`;


@Injectable({
	providedIn: 'root'
})
export class LogactionService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListLogaction(queryParams: QueryLogactionModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		// let params = new URLSearchParams();

		// for(const key in queryParams) {
		// 	if(queryParams[key]) params.set(key, queryParams[key]);
		// }

		return this.http.get<QueryResultsModel>(API_FLOOR_URL + '/list?' + params,{ headers: httpHeaders });
	}

	getGroupByLogCategory(): Observable<any>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		return this.http.get<any>(API_FLOOR_URL + '/groupbylogcategory', { headers: httpHeaders });
	}


	findLogactionById(_id: string): Observable<LogactionModel>{
		return this.http.get<LogactionModel>(`${API_FLOOR_URL}/${_id}`);
	}
	deleteLogaction(logactionId: string) {
		const url = `${API_FLOOR_URL}/delete/${logactionId}`;
		return this.http.delete(url);
	}
	updateLogaction(logaction: LogactionModel) {
		const url = `${API_FLOOR_URL}/edit/${logaction._id}`;
		return this.http.patch(url, logaction);
	}

	createLogaction(logaction: LogactionModel): Observable<LogactionModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<LogactionModel>(`${API_FLOOR_URL}/add`, logaction, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-logaction.xlsx");
	}
}
