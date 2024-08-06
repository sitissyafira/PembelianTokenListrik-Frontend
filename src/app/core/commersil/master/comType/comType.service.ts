import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ComTypeModel } from './comType.model';
import { environment } from '../../../../../environments/environment';
import { QueryResultsModel} from '../../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryComTypeModel } from './querycomType.model';

const API_BASE = `${environment.baseAPI}/api/commersil/mtype`;

@Injectable({
	providedIn: 'root'
})
export class ComTypeService {
	constructor(private http: HttpClient) {}
	getListComType(queryParams: QueryComTypeModel): Observable<QueryResultsModel>{
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
	
	findComTypeById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	

	deleteComType(comTypeId: string) {
		const url = `${API_BASE}/delete/${comTypeId}`;
		return this.http.delete(url);
	}

	deleteFlagComType(visitor: ComTypeModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateComType(comType: ComTypeModel) {
		const url = `${API_BASE}/edit/${comType._id}`;
		return this.http.patch(url, comType);
	}
	
	createComType(comType: ComTypeModel): Observable<ComTypeModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ComTypeModel>(`${API_BASE}/add`, comType, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-comType.xlsx");
	}
}
