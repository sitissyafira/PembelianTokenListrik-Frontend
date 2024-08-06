import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DivisionModel } from './division.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryDivisionModel } from './querydivision.model';

const API_BASE = `${environment.baseAPI}/api/division`;


@Injectable({
	providedIn: 'root'
})
export class DivisionService {
	constructor(private http: HttpClient) {}
	getListDivision(queryParams: QueryDivisionModel): Observable<QueryResultsModel>{
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
	
	findDivisionById(_id: string): Observable<DivisionModel>{
		return this.http.get<DivisionModel>(`${API_BASE}/${_id}`);
	}
	deleteDivision(divisionId: string) {
		const url = `${API_BASE}/delete/${divisionId}`;
		return this.http.delete(url);
	}

	deleteFlagDivision(visitor: DivisionModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateDivision(division: DivisionModel) {
		const url = `${API_BASE}/edit/${division._id}`;
		return this.http.patch(url, division);
	}
	
	createDivision(division: DivisionModel): Observable<DivisionModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<DivisionModel>(`${API_BASE}/add`, division, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-division.xlsx");
	}
}
