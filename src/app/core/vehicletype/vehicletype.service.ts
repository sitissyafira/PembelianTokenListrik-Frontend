import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { VehicleTypeModel } from './vehicletype.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';
import {QueryParamsModel} from '../../core/_base/crud/models/query-models/query-params.model';

const API_VEHICLE_TYPE_URL = `${environment.baseAPI}/api/vehicletype`;




@Injectable({
	providedIn: 'root'
})
export class VehicleTypeService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListVehicleType(queryParams: QueryParamsModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_VEHICLE_TYPE_URL}`);
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
		return this.http.get<QueryResultsModel>(API_VEHICLE_TYPE_URL + '/list?' + params,{ headers: httpHeaders });
	}
	deleteVehicleType(vehicletypeId: string) {
		const url = `${API_VEHICLE_TYPE_URL}/delete/${vehicletypeId}`;
		return this.http.delete(url);
	}
	updateVehicleType(vehicletype: VehicleTypeModel) {
		const url = `${API_VEHICLE_TYPE_URL}/edit/${vehicletype._id}`;
		return this.http.patch(url, vehicletype);
	}
	getVehicleById(id: string): Observable<any>{
		return this.http.get<any>(`${API_VEHICLE_TYPE_URL}/${id}`);
	}
	createVehicleType(vehicletype: VehicleTypeModel): Observable<VehicleTypeModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<VehicleTypeModel>(`${API_VEHICLE_TYPE_URL}/add`, vehicletype, { headers: httpHeaders});
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
