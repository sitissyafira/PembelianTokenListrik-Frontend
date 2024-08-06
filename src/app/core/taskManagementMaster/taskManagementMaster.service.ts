import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { TaskManagementMasterModel } from './taskManagementMaster.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QueryResultsModel } from '../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryTaskManagementMasterModel } from './querytaskManagementMaster.model';

const API_TENANT_URL = `${environment.baseAPI}/api/renter`;
const API_CUSTOMER_URL = `${environment.baseAPI}/api/taskManagementMaster`;


const API_EXCEL = `${environment.baseAPI}/api/excel/taskManagementMaster/export`;




@Injectable({
	providedIn: 'root'
})
export class TaskManagementMasterService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListTaskManagementMaster(queryParams: QueryTaskManagementMasterModel): Observable<QueryResultsModel> {
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
	getListTaskManagementMasterTenant(queryParams: QueryTaskManagementMasterModel): Observable<QueryResultsModel> {
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

	deleteTaskManagementMaster(taskManagementMasterId: string) {
		const url = `${API_CUSTOMER_URL}/delete/${taskManagementMasterId}`;
		return this.http.delete(url);
	}



	getTaskManagementMasterById(id: string): Observable<any> {
		return this.http.get<any>(`${API_CUSTOMER_URL}/${id}`);
	}
	getTaskManagementMasterTenantById(id: string): Observable<any> {
		return this.http.get<any>(`${API_TENANT_URL}/${id}`);
	}
	findUser(department: string, division: string): Observable<any> {
		return this.http.post<any>(`${API_CUSTOMER_URL}/finduser`, {department, division});
	}

	exportExcel(query : QueryTaskManagementMasterModel) {
		let options = {
			param: JSON.stringify(query)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return FileSaver.saveAs(`${API_EXCEL}?${params}`, "export-taskManagementMaster.xlsx");
	}


	updateTaskManagementMaster(taskManagementMaster: TaskManagementMasterModel) {
		const url = `${API_CUSTOMER_URL}/edit/${taskManagementMaster._id}`;
		return this.http.patch(url, taskManagementMaster);
	}
	createTaskManagementMaster(taskManagementMaster: TaskManagementMasterModel): Observable<TaskManagementMasterModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<TaskManagementMasterModel>(`${API_CUSTOMER_URL}/add`, taskManagementMaster, { headers: httpHeaders });
	}
	generateTaskManagementMasterCode(): Observable<QueryResultsModel> {
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
