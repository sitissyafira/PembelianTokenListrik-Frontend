import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FloorModel } from './floor.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';
import {QueryFloorModel} from './queryfloor.model';
import * as FileSaver from 'file-saver';

const API_FLOOR_URL = `${environment.baseAPI}/api/floor`;
const API_EXCEL = `${environment.baseAPI}/api/excel/floor/export`;




@Injectable({
	providedIn: 'root'
})
export class FloorService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListFloor(queryParams: QueryFloorModel): Observable<QueryResultsModel>{
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
	findFloorByParent(_id: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_FLOOR_URL}/parent/${_id}`);
	}
	findFloorById(id: any): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_FLOOR_URL}/${id}`);
	}
	findFloorByIdPlain(id: any): Observable<any>{
		return this.http.get<any>(`${API_FLOOR_URL}/${id}`);
	}
	exportExcel(){
		return FileSaver.saveAs(`${API_EXCEL}`, "export-floor.xlsx");
	}
	deleteFloor(floorId: string) {
		const url = `${API_FLOOR_URL}/delete/${floorId}`;
		return this.http.delete(url);
	}
	updateFloor(floor: FloorModel) {
		const url = `${API_FLOOR_URL}/edit/${floor._id}`;
		return this.http.patch(url, floor);
	}
	createFloor(floor: FloorModel): Observable<FloorModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<FloorModel>(`${API_FLOOR_URL}/add`, floor, { headers: httpHeaders});
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
