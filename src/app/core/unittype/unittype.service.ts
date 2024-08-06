import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { UnitTypeModel } from './unittype.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';
import {QueryParamsModel} from '../_base/crud/models/query-models/query-params.model';
import * as FileSaver from 'file-saver';

const API_FLOOR_URL = `${environment.baseAPI}/api/unittype`;
const API_CSV = `${environment.baseAPI}/api/excel/unittype/export`;




@Injectable({
	providedIn: 'root'
})
export class UnitTypeService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListUnitType(queryParams: QueryParamsModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_FLOOR_URL}`);
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
	findUnitTypeById(_id: string): Observable<UnitTypeModel>{
		return this.http.get<UnitTypeModel>(`${API_FLOOR_URL}/${_id}`);
	}
	deleteUnitType(unittypeId: string) {
		const url = `${API_FLOOR_URL}/delete/${unittypeId}`;
		return this.http.delete(url);
	}
	updateUnitType(unittype: UnitTypeModel) {
		const url = `${API_FLOOR_URL}/edit/${unittype._id}`;
		return this.http.patch(url, unittype);
	}
	createUnitType(unittype: UnitTypeModel): Observable<UnitTypeModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<UnitTypeModel>(`${API_FLOOR_URL}/add`, unittype, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-unittype.xlsx");
	}
}
