import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { InspeksiModel } from './inspeksi.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QueryResultsModel } from '../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryInspeksiModel } from './queryinspeksi.model';
import moment from 'moment';

const API_TENANT_URL = `${environment.baseAPI}/api/renter`;
const API_CUSTOMER_URL = `${environment.baseAPI}/api/inspeksi`;


const API_EXCEL = `${environment.baseAPI}/api/excel/inspeksi/export`;




@Injectable({
	providedIn: 'root'
})
export class InspeksiService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListInspeksi(queryParams: QueryInspeksiModel): Observable<QueryResultsModel> {
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
	getListInspeksiTenant(queryParams: QueryInspeksiModel): Observable<QueryResultsModel> {
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

	deleteInspeksi(inspeksiId: string) {
		const url = `${API_CUSTOMER_URL}/delete/${inspeksiId}`;
		return this.http.delete(url);
	}



	getInspeksiById(id: string): Observable<any> {
		return this.http.get<any>(`${API_CUSTOMER_URL}/${id}`);
	}
	getInspeksiTenantById(id: string): Observable<any> {
		return this.http.get<any>(`${API_TENANT_URL}/${id}`);
	}




	exportExcel(query : QueryInspeksiModel) {
		let options = {
			param: JSON.stringify(query)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		const periode = `${moment(query.filter.date).format("MMMM YYYY")}`
		return FileSaver.saveAs(`${API_EXCEL}?${params}`, `Inspeksi-${periode}.xlsx`);
	}


	updateInspeksi(inspeksi: InspeksiModel) {
		const url = `${API_CUSTOMER_URL}/edit/${inspeksi._id}`;
		return this.http.patch(url, inspeksi);
	}
	createInspeksi(inspeksi: InspeksiModel): Observable<InspeksiModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<InspeksiModel>(`${API_CUSTOMER_URL}/add`, inspeksi, { headers: httpHeaders });
	}
	generateInspeksiCode(): Observable<QueryResultsModel> {
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
