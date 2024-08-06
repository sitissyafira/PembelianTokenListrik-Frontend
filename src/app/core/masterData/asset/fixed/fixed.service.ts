import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FixedModel } from './fixed.model';
import {QueryResultsModel} from '../../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryFixedModel } from './queryfixed.model';
import { environment } from '../../../../../environments/environment';

const API_FLOOR_URL = `${environment.baseAPI}/api/fixedasset`;
const API_CSV = `${environment.baseAPI}/api/excel/fixedasset/export`;




@Injectable({
	providedIn: 'root'
})
export class FixedService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListFixed(queryParams: QueryFixedModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(API_FLOOR_URL + '/list?' + params,{ headers: httpHeaders });
	}

	
	findFixedById(_id: string): Observable<FixedModel>{
		return this.http.get<FixedModel>(`${API_FLOOR_URL}/${_id}`);
	}

	deleteFixed(fixedId: string) {
		const url = `${API_FLOOR_URL}/delete/${fixedId}`;
		return this.http.delete(url);
	}
	updateFixed(fixed: FixedModel) {
		const url = `${API_FLOOR_URL}/edit/${fixed._id}`;
		return this.http.patch(url, fixed);
	}
	
	createFixed(fixed: FixedModel): Observable<FixedModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<FixedModel>(`${API_FLOOR_URL}/add`, fixed, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-fixed.xlsx");
	}
}
