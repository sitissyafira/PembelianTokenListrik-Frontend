import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { WaterRateModel } from './rate.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryResultsModel} from '../../_base/crud';
import { QueryWaterRateModel } from './queryrate.model';

const API_WATER_RATE_URL = `${environment.baseAPI}/api/water/rate`;




@Injectable({
	providedIn: 'root'
})
export class WaterRateService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListWaterRate(queryParams: QueryWaterRateModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_WATER_RATE_URL}`);
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
		return this.http.get<QueryResultsModel>(API_WATER_RATE_URL + '/list?' + params,{ headers: httpHeaders });
	}
	deleteWaterRate(waterRateId: string) {
		const url = `${API_WATER_RATE_URL}/delete/${waterRateId}`;
		return this.http.delete(url);
	}
	updateWaterRate(waterRate: WaterRateModel) {
		const url = `${API_WATER_RATE_URL}/edit/${waterRate._id}`;
		return this.http.patch(url, waterRate);
	}
	createWaterRate(waterRate: WaterRateModel): Observable<WaterRateModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<WaterRateModel>(`${API_WATER_RATE_URL}/add`, waterRate, { headers: httpHeaders});
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
