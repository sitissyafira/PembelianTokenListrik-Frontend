import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DefectModel } from './defect.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryDefectModel } from './querydefect.model';

const API_FLOOR_URL = `${environment.baseAPI}/api/defect`;
const API_CSV = `${environment.baseAPI}/api/excel/defect/export`;

@Injectable({
	providedIn: 'root'
})
export class DefectService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListDefect(queryParams: QueryDefectModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_FLOOR_URL + '?' + params,{ headers: httpHeaders });
	}

	
	findDefectById(_id: string): Observable<DefectModel>{
		return this.http.get<DefectModel>(`${API_FLOOR_URL}/${_id}`);
	}
	deleteDefect(defectId: string) {
		const url = `${API_FLOOR_URL}/delete/${defectId}`;
		return this.http.delete(url);
	}
	updateDefect(defect: DefectModel) {
		const url = `${API_FLOOR_URL}/edit/${defect._id}`;
		return this.http.patch(url, defect);
	}
	createDefect(defect: DefectModel): Observable<DefectModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<DefectModel>(`${API_FLOOR_URL}/add`, defect, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}
	getListDefectbyCategoryId(id: string): Observable<any>{
		return this.http.get<any>(`${API_FLOOR_URL}/parent/${id}`);
	}
	

	generateCategoryCode(): Observable<QueryResultsModel>{
		const url = `${API_FLOOR_URL}/generate/code`;
		return this.http.get<QueryResultsModel>(url);
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-defect.xlsx");
	}
}
