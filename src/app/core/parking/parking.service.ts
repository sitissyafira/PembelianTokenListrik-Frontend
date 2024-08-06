import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ParkingModel } from './parking.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryParkingModel } from './queryparking.model';

const API_FLOOR_URL = `${environment.baseAPI}/api/parking`;
const API_CSV = `${environment.baseAPI}/api/excel/additionalParking/export`;

@Injectable({
	providedIn: 'root'
})
export class ParkingService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListParking(queryParams: QueryParkingModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		// let options = {
		// 	param: JSON.stringify(queryParams)
		// }
		let params = new URLSearchParams();
		// for (let key in options) {
		// 	console.log(options)
		// 	params.set(key, options[key])
		// }
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(API_FLOOR_URL + '/list?' + params,{ headers: httpHeaders });
	}

	
	findParkingById(_id: string): Observable<ParkingModel>{
		return this.http.get<ParkingModel>(`${API_FLOOR_URL}/${_id}`);
	}
	deleteParking(parkingId: string) {
		const url = `${API_FLOOR_URL}/delete/${parkingId}`;
		return this.http.delete(url);
	}
	updateParking(parking: ParkingModel) {
		const url = `${API_FLOOR_URL}/edit/${parking._id}`;
		return this.http.patch(url, parking);
	}
	createParking(parking: ParkingModel): Observable<ParkingModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ParkingModel>(`${API_FLOOR_URL}/add`, parking, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-parking.xlsx");
	}
}
