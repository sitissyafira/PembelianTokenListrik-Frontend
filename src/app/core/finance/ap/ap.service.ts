import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ApModel } from './ap.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel } from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryApModel } from './queryap.model';

const API_BASE = `${environment.baseAPI}/api/accpurchase`;


@Injectable({
	providedIn: 'root'
})
export class ApService {
	constructor(private http: HttpClient) { }
	getListAp(queryParams: QueryApModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		let options = {
			param: JSON.stringify(queryParams)
		}
		for (let key in options) {
			params.set(key, options[key]);
		}

		return this.http.get<QueryResultsModel>(API_BASE + '/list?' + params, { headers: httpHeaders });

		// let options = {}
		// if (queryParams.fromDate !== undefined || queryParams.toDate !== undefined) {
		// 	options = {
		// 		search : queryParams.search,
		// 		pageNumber : queryParams.pageNumber,
		// 		limit : queryParams.limit,
		// 		fromDate: queryParams.fromDate ? queryParams.fromDate : undefined,
		// 		toDate: queryParams.toDate ? queryParams.toDate : undefined,
		// 	}	
		// } else {
		// 	options = {
		// 		search : queryParams.search,
		// 		pageNumber : queryParams.pageNumber,
		// 		limit : queryParams.limit,			
		// 	} 
		// }

		// for (let key in options) {
		// 	if (key === 'search' && !options[key]) continue
		// 	params.set(key, options[key])

		// }
		// const url = `${API_BASE}/list?${params}`;
		// return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	findApById(_id: string): Observable<any> {
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}

	getListAPTotal(queryParams: any): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		let options = {
			param: JSON.stringify(queryParams)
		}
		for (let key in options) {
			params.set(key, options[key]);
		}

		return this.http.get<QueryResultsModel>(API_BASE + '/list?' + params, { headers: httpHeaders });
	}

	deleteAp(apId: string) {
		const url = `${API_BASE}/delete/${apId}`;
		return this.http.delete(url);
	}

	deleteFlagAp(visitor: ApModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateAp(ap: ApModel) {
		const url = `${API_BASE}/edit/${ap._id}`;
		return this.http.patch(url, ap);
	}

	createAp(ap: ApModel): Observable<ApModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ApModel>(`${API_BASE}/add`, ap, { headers: httpHeaders });
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}

	exportExcel(ap) {
		return FileSaver.saveAs(`${API_BASE}/excel/export?startDate=${ap.startDate}&endDate=${ap.endDate}`, `export-a-${ap.startDate}-${ap.endDate}.xlsx`);

	}
}
