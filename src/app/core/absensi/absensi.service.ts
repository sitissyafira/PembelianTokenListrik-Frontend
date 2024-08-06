import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AbsensiModel } from './absensi.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QueryResultsModel } from '../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryAbsensiModel } from './queryabsensi.model';
import moment from 'moment';

const API_TENANT_URL = `${environment.baseAPI}/api/renter`;
const API_CUSTOMER_URL = `${environment.baseAPI}/api/absensi`;


const API_EXCEL = `${environment.baseAPI}/api/excel/absensi/export`;




@Injectable({
	providedIn: 'root'
})
export class AbsensiService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListAbsensi(queryParams: QueryAbsensiModel): Observable<QueryResultsModel> {
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
	getListAbsensiTenant(queryParams: QueryAbsensiModel): Observable<QueryResultsModel> {
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

	deleteAbsensi(absensiId: string) {
		const url = `${API_CUSTOMER_URL}/delete/${absensiId}`;
		return this.http.delete(url);
	}



	getAbsensiById(id: string): Observable<any> {
		return this.http.get<any>(`${API_CUSTOMER_URL}/${id}`);
	}
	getAbsensiTenantById(id: string): Observable<any> {
		return this.http.get<any>(`${API_TENANT_URL}/${id}`);
	}




	exportExcel(query : QueryAbsensiModel) {
		let options = {
			param: JSON.stringify(query)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		const periode = `${moment(query.filter.date).format("MMMM YYYY")}`
		return FileSaver.saveAs(`${API_EXCEL}?${params}`, `Attendance-${periode}.xlsx`);
	}


	updateAbsensi(absensi: AbsensiModel) {
		const url = `${API_CUSTOMER_URL}/edit/${absensi._id}`;
		return this.http.patch(url, absensi);
	}
	createAbsensi(absensi: AbsensiModel): Observable<AbsensiModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<AbsensiModel>(`${API_CUSTOMER_URL}/add`, absensi, { headers: httpHeaders });
	}
	generateAbsensiCode(): Observable<QueryResultsModel> {
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
