import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { GalonRateModel } from './rate.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel } from '../../_base/crud';
import { QueryGalonRateModel } from './queryrate.model';

const API_GALON_RATE_URL = `${environment.baseAPI}/api/galon/rate`;
// const API_GALON_RATE_URL = `${environment.baseAPI}/api/power/rate`;




@Injectable({
	providedIn: 'root'
})
export class GalonRateService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListGalonRate(queryParams: QueryGalonRateModel): Observable<QueryResultsModel> {
		// return this.http.get<QueryResultsModel>(`${API_GALON_RATE_URL}`);
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
		return this.http.get<QueryResultsModel>(API_GALON_RATE_URL + '/list/master?' + params, { headers: httpHeaders });
	}
	deleteGalonRate(galonRateId: string) {
		const url = `${API_GALON_RATE_URL}/delete/${galonRateId}`;
		return this.http.delete(url);
	}
	updateGalonRate(galonRate: GalonRateModel) {
		const url = `${API_GALON_RATE_URL}/edit/${galonRate._id}`;
		return this.http.patch(url, galonRate);
	}
	createGalonRate(galonRate: GalonRateModel): Observable<GalonRateModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<GalonRateModel>(`${API_GALON_RATE_URL}/add`, galonRate, { headers: httpHeaders });
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
