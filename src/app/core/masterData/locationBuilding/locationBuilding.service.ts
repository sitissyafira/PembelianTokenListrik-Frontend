import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { LocationBuildingModel } from './locationBuilding.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryLocationBuildingModel } from './querylocationBuilding.model';

const API_BASE = `${environment.baseAPI}/api/locationBuilding`;


@Injectable({
	providedIn: 'root'
})
export class LocationBuildingService {
	constructor(private http: HttpClient) {}
	getListLocationBuilding(queryParams: QueryLocationBuildingModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			search : queryParams.search,
			pageNumber : queryParams.pageNumber,
			limit : queryParams.limit
		}
		let params = new URLSearchParams();
		for (let key in options) {
			if (key === 'search' && !options[key]) continue
			params.set(key, options[key])

		}
		const url = `${API_BASE}/list?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}
	
	findLocationBuildingById(_id: string): Observable<LocationBuildingModel>{
		return this.http.get<LocationBuildingModel>(`${API_BASE}/${_id}`);
	}
	deleteLocationBuilding(locationBuildingId: string) {
		const url = `${API_BASE}/delete/${locationBuildingId}`;
		return this.http.delete(url);
	}

	deleteFlagLocationBuilding(visitor: LocationBuildingModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateLocationBuilding(locationBuilding: LocationBuildingModel) {
		const url = `${API_BASE}/edit/${locationBuilding._id}`;
		return this.http.patch(url, locationBuilding);
	}
	
	createLocationBuilding(locationBuilding: LocationBuildingModel): Observable<LocationBuildingModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<LocationBuildingModel>(`${API_BASE}/add`, locationBuilding, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-locationBuilding.xlsx");
	}

	getLocationSuggestionWithOpenStreetMap(query: String) {

		return this.http.get<any>(`${API_BASE}/locationSuggestion?search=${query}`);
	}

	getDetailLocationWithOpenStreetMap(longitude, latitude) {
		console.log(longitude, 'longitude')
		console.log(latitude, 'latitude')
    	const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
		return this.http.get<any>(url)
	}

	// getLocationSuggestionWithOpenStreetMap(value) {
	// 	const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1`;
    //   	return this.http.get<any[]>(url);
	// }
}
