import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ExternalUserModel } from './externalUser.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QueryResultsModel } from '../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryExternalUserModel } from '../externalUser/queryexternalUser.model';

const API_TENANT_URL = `${environment.baseAPI}/api/renter`;
const API_CUSTOMER_URL = `${environment.baseAPI}/api/externalUser`;


const API_EXCEL = `${environment.baseAPI}/api/excel/externalUser/export`;




@Injectable({
	providedIn: 'root'
})
export class ExternalUserService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListExternalUser(queryParams: QueryExternalUserModel): Observable<QueryResultsModel> {
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
	getListExternalUserTenant(queryParams: QueryExternalUserModel): Observable<QueryResultsModel> {
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

	deleteExternalUser(externalUserId: string) {
		const url = `${API_CUSTOMER_URL}/delete/${externalUserId}`;
		return this.http.delete(url);
	}



	getExternalUserById(id: string): Observable<any> {
		return this.http.get<any>(`${API_CUSTOMER_URL}/${id}`);
	}
	getExternalUserTenantById(id: string): Observable<any> {
		return this.http.get<any>(`${API_TENANT_URL}/${id}`);
	}




	exportExcel() {
		return FileSaver.saveAs(`${API_EXCEL}`, "export-externalUser.xlsx");
	}


	updateExternalUser(id, externalUser: ExternalUserModel) {
		const url = `${API_CUSTOMER_URL}/edit/${id}`;
		return this.http.patch(url, externalUser);
	}
	createExternalUser(externalUser: ExternalUserModel): Observable<ExternalUserModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ExternalUserModel>(`${API_CUSTOMER_URL}/add`, externalUser, { headers: httpHeaders });
	}
	generateExternalUserCode(): Observable<QueryResultsModel> {
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
