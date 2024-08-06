import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { GasRateModel } from './rate.model';
import {QueryResultsModel} from '../../_base/crud';
import { QueryGasRateModel } from './queryrate.model';
import { environment } from '../../../../environments/environment';

const API_GAS_RATE_URL = `${environment.baseAPI}/api/gas/rate`;




@Injectable({
	providedIn: 'root'
})
export class GasRateService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListGasRate(queryParams: QueryGasRateModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_GAS_RATE_URL}`);
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
		return this.http.get<QueryResultsModel>(API_GAS_RATE_URL + '?' + params,{ headers: httpHeaders });
	}
	deleteGasRate(gasRateId: string) {
		const url = `${API_GAS_RATE_URL}/delete/${gasRateId}`;
		return this.http.delete(url);
	}
	updateGasRate(gasRate: GasRateModel) {
		const url = `${API_GAS_RATE_URL}/edit/${gasRate._id}`;
		return this.http.patch(url, gasRate);
	}
	createGasRate(gasRate: GasRateModel): Observable<GasRateModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<GasRateModel>(`${API_GAS_RATE_URL}/add`, gasRate, { headers: httpHeaders});
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
