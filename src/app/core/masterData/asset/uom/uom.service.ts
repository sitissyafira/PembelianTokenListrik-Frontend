import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { UomModel } from './uom.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {QueryResultsModel} from '../../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryUomModel } from './queryuom.model';

const API_FLOOR_URL = `${environment.baseAPI}/api/uom`;
const API_CSV = `${environment.baseAPI}/api/excel/uom/export`;


@Injectable({
	providedIn: 'root'
})
export class UomService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListUom(queryParams: QueryUomModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(API_FLOOR_URL + '/list?' + params,{ headers: httpHeaders });
	}

	
	findUomById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_FLOOR_URL}/${_id}`);
	}
	deleteUom(uomId: string) {
		const url = `${API_FLOOR_URL}/delete/${uomId}`;
		return this.http.delete(url);
	}
	updateUom(uom: UomModel) {
		const url = `${API_FLOOR_URL}/edit/${uom._id}`;
		return this.http.patch(url, uom);
	}
	createUom(uom: UomModel): Observable<UomModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<UomModel>(`${API_FLOOR_URL}/add`, uom, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-uom.xlsx");
	}
}
