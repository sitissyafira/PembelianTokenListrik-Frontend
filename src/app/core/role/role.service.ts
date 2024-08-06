import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RoleModel } from './role.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryRoleModel } from './queryrole.model';

const API_FLOOR_URL = `${environment.baseAPI}/api/role`;
const API_CSV = `${environment.baseAPI}/api/excel/role/export`;




@Injectable({
	providedIn: 'root'
})
export class RoleService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListRole(queryParams: QueryRoleModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_FLOOR_URL + '/list?' + params,{ headers: httpHeaders });
	}

	findRoleById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_FLOOR_URL}/${_id}`);
	}
	deleteRole(roleId: string) {
		const url = `${API_FLOOR_URL}/delete/${roleId}`;
		return this.http.delete(url);
	}
	updateRole(role: RoleModel) {
		const url = `${API_FLOOR_URL}/edit/${role._id}`;
		return this.http.patch(url, role);
	}
	createRole(role: RoleModel): Observable<RoleModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<RoleModel>(`${API_FLOOR_URL}/add`, role, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}


	generateRoleCode(): Observable<QueryResultsModel>{
		const url = `${API_FLOOR_URL}/generate/code`;
		return this.http.get<QueryResultsModel>(url);
	}


	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-role.xlsx");
	}
}
