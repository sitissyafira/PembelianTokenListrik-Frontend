import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { UnitRateModel } from './unitrate.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';
import {QueryParamsModel} from '../_base/crud/models/query-models/query-params.model';
import * as FileSaver from 'file-saver';

const API_UNITRATE_URL = `${environment.baseAPI}/api/unitrate`;
const API_EXCEL = `${environment.baseAPI}/api/excel/unitrate/export`;




@Injectable({
	providedIn: 'root'
})
export class UnitRateService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListUnitRate(queryParams: QueryParamsModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_UNITRATE_URL}`);
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
		return this.http.get<QueryResultsModel>(API_UNITRATE_URL + '/list?' + params,{ headers: httpHeaders });
	}
	findUnitRateById(_id: string): Observable<UnitRateModel>{
		return this.http.get<UnitRateModel>(`${API_UNITRATE_URL}/${_id}`);
	}
	deleteUnitRate(unitrateId: string) {
		const url = `${API_UNITRATE_URL}/delete/${unitrateId}`;
		return this.http.delete(url);
	}
	updateUnitRate(unitrate: UnitRateModel) {
		const url = `${API_UNITRATE_URL}/edit/${unitrate._id}`;
		return this.http.patch(url, unitrate);
	}
	createUnitRate(unitrate: UnitRateModel): Observable<UnitRateModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<UnitRateModel>(`${API_UNITRATE_URL}/add`, unitrate, { headers: httpHeaders});
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_EXCEL}`, "export-unitrate.xlsx");
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
