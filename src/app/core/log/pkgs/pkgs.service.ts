import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PkgsModel } from './pkgs.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryParamsModel, QueryResultsModel} from '../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryPkgsModel } from './querypkgs.model';

// const API_BASE = `${environment.baseAPI}/api/acctype`;
const API_BASE = `${environment.baseAPI}/api/log/packagemanagement`;
const API_CSV = `${environment.baseAPI}/api/excel/acctype/export`;

@Injectable({
	providedIn: 'root'
})
export class PkgsService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListPkgs(queryParams: QueryPkgsModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			search : queryParams.search,
			page : queryParams.page,
			limit : queryParams.limit
		}
		let params = new URLSearchParams();
		for (let key in options) {
			if (key === 'search' && !options[key]) continue
			params.set(key, options[key])

		}
		// params.set("param", JSON.stringify(queryParams));
		const url = `${API_BASE}/list?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	findPkgsById(_id: string): Observable<PkgsModel>{
		return this.http.get<PkgsModel>(`${API_BASE}/${_id}`);
	}
	deletePkgs(pkgsId: string) {
		const url = `${API_BASE}/delete/${pkgsId}`;
		return this.http.delete(url);
	}
	updatePkgs(pkgs: PkgsModel) {
		const url = `${API_BASE}/edit/${pkgs._id}`;
		return this.http.patch(url, pkgs);
	}
	createPkgs(pkgs: PkgsModel): Observable<PkgsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PkgsModel>(`${API_BASE}/add`, pkgs, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-pkgs.xlsx");
	}
}
