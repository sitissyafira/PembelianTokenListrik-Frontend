import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RenterModel } from './renter.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QueryResultsModel } from '../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryRenterModel } from '../renter/queryrenter.model';

const API_CUSTOMER_URL = `${environment.baseAPI}/api/renter`;


const API_EXCEL = `${environment.baseAPI}/api/excel/renter/export`;




@Injectable({
	providedIn: 'root'
})
export class RenterService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListRenter(queryParams: QueryRenterModel): Observable<QueryResultsModel> {
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
	deleteRenter(renterId: string) {
		const url = `${API_CUSTOMER_URL}/delete/${renterId}`;
		return this.http.delete(url);
	}



	getRenterById(id: string): Observable<any> {
		return this.http.get<any>(`${API_CUSTOMER_URL}/${id}`);
	}




	exportExcel() {
		return FileSaver.saveAs(`${API_EXCEL}`, "export-renter.xlsx");
	}


	updateRenter(renter: RenterModel) {
		const url = `${API_CUSTOMER_URL}/edit/${renter._id}`;
		return this.http.patch(url, renter);
	}
	createRenter(renter: RenterModel): Observable<RenterModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<RenterModel>(`${API_CUSTOMER_URL}/add`, renter, { headers: httpHeaders });
	}
	generateRenterCode(): Observable<QueryResultsModel> {
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
