import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AmModel } from './am.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryResultsModel} from '../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryAmModel } from './queryam.model';

const API_FLOOR_URL = `${environment.baseAPI}/api/asset/management`;
const API_CSV = `${environment.baseAPI}/api/excel/assetManagement/export`;

@Injectable({
	providedIn: 'root'
})
export class AmService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListAm(queryParams: QueryAmModel): Observable<QueryResultsModel>{
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

	
	findAmById(_id: string): Observable<AmModel>{
		return this.http.get<AmModel>(`${API_FLOOR_URL}/${_id}`);
	}


	findAmModelById(id: string): Observable<any>{
		return this.http.get<any>(`${API_FLOOR_URL}/${id}`);
	}

	deleteAm(amId: string) {
		const url = `${API_FLOOR_URL}/delete/${amId}`;
		return this.http.delete(url);
	}
	
	updateAm(am: AmModel) {
		const url = `${API_FLOOR_URL}/edit/${am._id}`;
		return this.http.patch(url, am);
	}

	createAm(am: AmModel): Observable<AmModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<AmModel>(`${API_FLOOR_URL}/add`, am, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-am.xlsx");
	}
}
