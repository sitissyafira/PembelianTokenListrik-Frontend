import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PowerRateModel } from './rate.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryResultsModel} from '../../_base/crud';
import { QueryPowerRateModel } from './queryrate.model';

const API_POWER_RATE_URL = `${environment.baseAPI}/api/power/rate`;




@Injectable({
	providedIn: 'root'
})
export class PowerRateService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListPowerRate(queryParams: QueryPowerRateModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_POWER_RATE_URL}`);
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
		return this.http.get<QueryResultsModel>(API_POWER_RATE_URL + '/list?' + params,{ headers: httpHeaders });
	}
	deletePowerRate(powerRateId: string) {
		const url = `${API_POWER_RATE_URL}/delete/${powerRateId}`;
		return this.http.delete(url);
	}
	updatePowerRate(powerRate: PowerRateModel) {
		const url = `${API_POWER_RATE_URL}/edit/${powerRate._id}`;
		return this.http.patch(url, powerRate);
	}
	createPowerRate(powerRate: PowerRateModel): Observable<PowerRateModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PowerRateModel>(`${API_POWER_RATE_URL}/add`, powerRate, { headers: httpHeaders});
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
