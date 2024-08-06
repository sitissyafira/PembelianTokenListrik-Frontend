import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ApplicationModel } from './application.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryApplicationModel } from './queryapplication.model';

const API_FLOOR_URL = `${environment.baseAPI}/api/application`;
const API_CSV = `${environment.baseAPI}/api/excel/application/export`;




@Injectable({
	providedIn: 'root'
})
export class ApplicationService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListApplication(queryParams: QueryApplicationModel): Observable<QueryResultsModel>{
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

	
	findApplicationById(_id: string): Observable<ApplicationModel>{
		return this.http.get<ApplicationModel>(`${API_FLOOR_URL}/${_id}`);
	}
	deleteApplication(applicationId: string) {
		const url = `${API_FLOOR_URL}/${applicationId}`;
		return this.http.delete(url);
	}
	updateApplication(application: ApplicationModel) {
		const url = `${API_FLOOR_URL}/${application._id}`;
		return this.http.patch(url, application);
	}
	createApplication(application: ApplicationModel): Observable<ApplicationModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ApplicationModel>(`${API_FLOOR_URL}`, application, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-application.xlsx");
	}
}
