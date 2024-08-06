import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SubdefectModel } from './subdefect.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QuerySubdefectModel } from './querysubdefect.model';

const API_FLOOR_URL = `${environment.baseAPI}/api/subdefect`;
const API_CSV = `${environment.baseAPI}/api/excel/subdefect/export`;




@Injectable({
	providedIn: 'root'
})
export class SubdefectService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListSubdefect(queryParams: QuerySubdefectModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		// let options = {
		// 	param: JSON.stringify(queryParams)
		// }
		let params = new URLSearchParams();
		// for (let key in options) {
		// 	params.set(key, options[key])
		// }

		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(API_FLOOR_URL + '?' + params,{ headers: httpHeaders });
	}

	
	findSubdefectById(_id: string): Observable<any>{
		return this.http.get<SubdefectModel>(`${API_FLOOR_URL}/${_id}`);
	}

	findSubdefectByIdPriority(id: string): Observable<any>{
		return this.http.get<any>(`${API_FLOOR_URL}/${id}`);
	}

	findSubdefectByIdParent(_id: string): Observable<any>{
		return this.http.get<any>(`${API_FLOOR_URL}/parent/${_id}`);
	}

	deleteSubdefect(subdefectId: string) {
		const url = `${API_FLOOR_URL}/delete/${subdefectId}`;
		return this.http.delete(url);
	}
	updateSubdefect(subdefect: SubdefectModel) {
		const url = `${API_FLOOR_URL}/edit/${subdefect._id}`;
		return this.http.patch(url, subdefect);
	}
	createSubdefect(subdefect: SubdefectModel): Observable<SubdefectModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<SubdefectModel>(`${API_FLOOR_URL}/add`, subdefect, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	generateSubdefectCode(): Observable<QueryResultsModel>{
		const url = `${API_FLOOR_URL}/generate/code`;
		return this.http.get<QueryResultsModel>(url);
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-subdefect.xlsx");
	}
}
