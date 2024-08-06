import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ManagementTaskModel } from './managementTask.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QueryResultsModel } from '../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryManagementTaskModel } from './querymanagementTask.model';

const API_TENANT_URL = `${environment.baseAPI}/api/renter`;
const API_CUSTOMER_URL = `${environment.baseAPI}/api/taskManagement`;


const API_EXCEL = `${environment.baseAPI}/api/taskManagement/export`;




@Injectable({
	providedIn: 'root'
})
export class ManagementTaskService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListManagementTask(queryParams: QueryManagementTaskModel): Observable<QueryResultsModel> {
		// return this.http.get<QueryResultsModel>(`${API_CUSTOMER_URL}`);
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
		return this.http.get<QueryResultsModel>(API_CUSTOMER_URL + '/list?' + params, { headers: httpHeaders });
	}
	getListManagementTaskTenant(queryParams: QueryManagementTaskModel): Observable<QueryResultsModel> {
		// return this.http.get<QueryResultsModel>(`${API_CUSTOMER_URL}`);
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
		return this.http.get<QueryResultsModel>(API_TENANT_URL + '/list?' + params, { headers: httpHeaders });
	}

	deleteManagementTask(managementTaskId: string) {
		const url = `${API_CUSTOMER_URL}/delete/${managementTaskId}`;
		return this.http.delete(url);
	}



	getManagementTaskById(id: string): Observable<any> {
		return this.http.get<any>(`${API_CUSTOMER_URL}/${id}`);
	}
	getManagementTaskTenantById(id: string): Observable<any> {
		return this.http.get<any>(`${API_TENANT_URL}/${id}`);
	}




	exportExcel(query : QueryManagementTaskModel) {
		let options = {
			param: JSON.stringify(query)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return FileSaver.saveAs(`${API_EXCEL}?${params}`, "export-taskManagement.xlsx");
	}


	updateManagementTask(managementTask: ManagementTaskModel) {
		const url = `${API_CUSTOMER_URL}/edit/${managementTask._id}`;
		return this.http.patch(url, managementTask);
	}
	createManagementTask(managementTask: ManagementTaskModel): Observable<ManagementTaskModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ManagementTaskModel>(`${API_CUSTOMER_URL}/add`, managementTask, { headers: httpHeaders });
	}
	generateManagementTaskCode(): Observable<QueryResultsModel> {
		const url = `${API_CUSTOMER_URL}/generate/code`;
		return this.http.get<QueryResultsModel>(url);
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
