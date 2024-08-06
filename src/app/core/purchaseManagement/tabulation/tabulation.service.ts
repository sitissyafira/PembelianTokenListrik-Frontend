import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { TabulationModel } from './tabulation.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryTabulationModel } from './querytabulation.model';

const API_BASE = `${environment.baseAPI}/api/purchase/tabulation`;
const API_CSV = `${environment.baseAPI}/api/purchase/tabulation/downloadxlxs`;


@Injectable({
	providedIn: 'root'
})
export class TabulationService {
	constructor(private http: HttpClient) {}
	getListTabulation(queryParams: QueryTabulationModel): Observable<QueryResultsModel>{
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
		const url = `${API_BASE}/all?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getListSelTabulation(queryParams: QueryTabulationModel): Observable<QueryResultsModel>{
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
		const url = `${API_BASE}/all/quo?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	generateTabulationCode(): Observable<QueryResultsModel>{
		const url = `${API_BASE}/generate`;
		return this.http.get<QueryResultsModel>(url);
	}

	//findTabulationById(_id: string): Observable<TabulationModel>{
	findTabulationById(_id: string): Observable<any>{
		//return this.http.get<TabulationModel>(`${API_BASE}/${_id}`);
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	deleteTabulation(tabulationId: string) {
		const url = `${API_BASE}/delete/${tabulationId}`;
		return this.http.delete(url);
	}

	deleteFlagTabulation(visitor: TabulationModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateTabulation(tabulation: TabulationModel) {
		const url = `${API_BASE}/edit/${tabulation._id}`;
		return this.http.patch(url, tabulation);
	}

	createTabulation(tabulation: TabulationModel): Observable<TabulationModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<TabulationModel>(`${API_BASE}/add`, tabulation, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-tabulation.xlsx");
	}
}
