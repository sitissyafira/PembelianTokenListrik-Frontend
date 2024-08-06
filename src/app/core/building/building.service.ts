import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BuildingModel } from './building.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';
import {QueryBuildingModel} from './querybuilding.model';

const API_BUILDING_URL = `${environment.baseAPI}/api/building`;



@Injectable({
	providedIn: 'root'
})
export class BuildingService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListBuilding(queryParams: QueryBuildingModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_BUILDING_URL}`);
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
		return this.http.get<QueryResultsModel>(API_BUILDING_URL + '/list?' + params,{ headers: httpHeaders });
	}
	findBuildingByParent(_id: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_BUILDING_URL}/parent/${_id}`);
	}
	deleteBuilding(buildingId: string) {
		const url = `${API_BUILDING_URL}/delete/${buildingId}`;
		return this.http.delete(url);
	}
	updateBuilding(building: BuildingModel) {
		const url = `${API_BUILDING_URL}/edit/${building._id}`;
		return this.http.patch(url, building);
	}
	createBuilding(building: BuildingModel): Observable<BuildingModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<BuildingModel>(`${API_BUILDING_URL}/add`, building, { headers: httpHeaders});
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
