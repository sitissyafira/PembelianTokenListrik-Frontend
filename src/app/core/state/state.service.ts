import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ProvinceModel } from './province.model';
import { RegencyModel } from './regency.model';
import { DistrictModel } from './district.model';
import { VillageModel } from './village.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';
import {QueryParamsModel} from '../_base/crud/models/query-models/query-params.model';

const API_STATE_URL = `${environment.baseAPI}/api/state`;



@Injectable({
	providedIn: 'root'
})
export class StateService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListProvince(queryParams: QueryParamsModel): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_STATE_URL}/province`);
	}
	getListRegency(queryParams: QueryParamsModel): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_STATE_URL}/regency`);
	}
	getListDistrict(queryParams: QueryParamsModel): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_STATE_URL}/district`);
	}
	getListVillage(queryParams: QueryParamsModel): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_STATE_URL}/village`);
	}
	getListRegencyByParent(queryParams: QueryParamsModel, provinceId: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_STATE_URL}/regency/${provinceId}`);
	}
	getListDistrictByParent(queryParams: QueryParamsModel, regencyId: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_STATE_URL}/district/${regencyId}`);
	}
	getListVillageByParent(queryParams: QueryParamsModel, villageId: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_STATE_URL}/village/${villageId}`);
	}
	getListPostalcode(queryParams: QueryParamsModel, regencyName: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_STATE_URL}/kodepos/${regencyName}`);
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
