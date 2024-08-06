import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PinjamPakaiModel } from './pinjamPakai.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryResultsModel} from '../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryPinjamPakaiModel } from './querypinjamPakai.model';

const API_BANK_URL = `${environment.baseAPI}/api/contract/pp`;
const API_CSV = `${environment.baseAPI}/api/excel/pinjamPakai/export`;




@Injectable({
	providedIn: 'root'
})
export class PinjamPakaiService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListPinjamPakai(queryParams: QueryPinjamPakaiModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(API_BANK_URL + '/list?' + params,{ headers: httpHeaders });
	}

	
	findPinjamPakaiById(_id: string): Observable<PinjamPakaiModel>{
		return this.http.get<PinjamPakaiModel>(`${API_BANK_URL}/${_id}`);
	}

	deletePinjamPakai(pinjamPakaiId: string) {
		const url = `${API_BANK_URL}/delete/${pinjamPakaiId}`;
		return this.http.delete(url);
	}
	updatePinjamPakai(pinjamPakai: PinjamPakaiModel) {
		const url = `${API_BANK_URL}/edit/${pinjamPakai._id}`;
		return this.http.patch(url, pinjamPakai);
	}
	createPinjamPakai(pinjamPakai: PinjamPakaiModel): Observable<PinjamPakaiModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PinjamPakaiModel>(`${API_BANK_URL}/add`, pinjamPakai, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-pinjamPakai.xlsx");
	}
}
