import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PowerPrabayarModel } from './prabayar.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryResultsModel} from '../../_base/crud';
import { QueryPowerPrabayarModel } from './queryprabayar.model';

const API_POWER_RATE_URL = `${environment.baseAPI}/api/tokenmaster`;




@Injectable({
	providedIn: 'root'
})
export class PowerPrabayarService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListPowerPrabayar(queryParams: QueryPowerPrabayarModel): Observable<QueryResultsModel>{
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
		return this.http.get<QueryResultsModel>(API_POWER_RATE_URL + '/list?' + params, { headers: httpHeaders });
	}
	deletePowerPrabayar(powerPrabayarId: string) {
		const url = `${API_POWER_RATE_URL}/delete/${powerPrabayarId}`;
		return this.http.delete(url);
	}
	updatePowerPrabayar(powerPrabayar: PowerPrabayarModel) {
		const url = `${API_POWER_RATE_URL}/update/${powerPrabayar._id}`;
		return this.http.patch(url, powerPrabayar);
	}
	createPowerPrabayar(powerPrabayar: PowerPrabayarModel): Observable<PowerPrabayarModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PowerPrabayarModel>(`${API_POWER_RATE_URL}/create`, powerPrabayar, { headers: httpHeaders});
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
