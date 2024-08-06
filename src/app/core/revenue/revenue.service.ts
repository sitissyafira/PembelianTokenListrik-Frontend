import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RevenueModel } from './revenue.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryRevenueModel } from './queryrevenue.model';

const API_FLOOR_URL = `${environment.baseAPI}/api/mstrevenue`;
const API_CSV = `${environment.baseAPI}/api/excel/mstrevenue/export`;




@Injectable({
	providedIn: 'root'
})
export class RevenueService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListRevenue(queryParams: QueryRevenueModel): Observable<QueryResultsModel>{
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
		return this.http.get<QueryResultsModel>(API_FLOOR_URL + '/list?' + params,{ headers: httpHeaders });
	}

	
	findRevenueById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_FLOOR_URL}/${_id}`);
	}

	
	deleteRevenue(revenueId: string) {
		const url = `${API_FLOOR_URL}/delete/${revenueId}`;
		return this.http.delete(url);
	}
	updateRevenue(revenue: RevenueModel) {
		const url = `${API_FLOOR_URL}/edit/${revenue._id}`;
		return this.http.patch(url, revenue);
	}
	createRevenue(revenue: RevenueModel): Observable<RevenueModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<RevenueModel>(`${API_FLOOR_URL}/add`, revenue, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-revenue.xlsx");
	}
}
