import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { VisitorModel } from './visitor.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { QueryParamsModel, QueryResultsModel } from '../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryVisitorModel } from './queryvisitor.model';

// const API_BASE = `${environment.baseAPI}/api/acctype`;
const API_BASE = `${environment.baseAPI}/api/visitor`;

const API_CSV = `${environment.baseAPI}/api/excel/visitormanagement/export`;

@Injectable({
	providedIn: 'root'
})
export class VisitorService {
	constructor(private http: HttpClient) { }
	// get list block group
	// getListVisitor(queryParams: QueryVisitorModel): Observable<QueryResultsModel> {
	// 	const httpHeaders = new HttpHeaders();
	// 	httpHeaders.set('Content-Type', 'application/json');
	// 	let options = {
	// 		search: queryParams.search,
	// 		fromDate: queryParams.fromDate,
	// 		toDate: queryParams.toDate,
	// 		pageNumber: queryParams.pageNumber,
	// 		limit: queryParams.limit

	// 	}
	// 	let params = new URLSearchParams();

	// 	for (let key in options) {
	// 		if (key === 'search' && !options[key]) continue
	// 		if (key === 'fromDate' || key === 'toDate') {
	// 			if ((typeof options.fromDate === 'undefined') || (typeof options.toDate === 'undefined'))
	// 				continue
	// 		}

	// 		params.set(key, options[key])
	// 	}
	// 	// params.set("param", JSON.stringify(queryParams));

	// 	const url = `${API_BASE}/listdefault?${params}`;
	// 	return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });

	// 	// const urlDefault = `${API_BASE}/list?${params}`;
	// 	// return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	// }
	getListVisitor(queryParams: QueryVisitorModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}

		// params.set("param", JSON.stringify(queryParams));
		const url = `${API_BASE}/get/all?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	findVisitorById(_id: string): Observable<any> {
		// return this.http.get<VisitorModel>(`${API_BASE}/${_id}`);
		return this.http.get<any>(`${API_BASE}/get/data/${_id}`);
	}
	updateIsRead(_id: string): Observable<any> {
		// return this.http.get<VisitorModel>(`${API_BASE}/${_id}`);
		return this.http.patch<any>(`${API_BASE}/update/isread/${_id}`, { data: 'tester' });
	}

	deleteVisitor(visitorId: string) {
		const url = `${API_BASE}/delete/${visitorId}`;
		return this.http.delete(url);
	}

	deleteFlagPackages(visitor: VisitorModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateVisitor(visitor, _id) {
		// const url = `${API_BASE}/update/${visitor._id}`;
		const url = `${API_BASE}/update/web/${_id}`;
		return this.http.patch(url, visitor);
	}


	createVisitor(visitor: VisitorModel): Observable<VisitorModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		// return this.http.post<VisitorModel>(`${API_BASE}/add`, visitor, { headers: httpHeaders });
		return this.http.post<VisitorModel>(`${API_BASE}/add/web`, visitor, { headers: httpHeaders });
	}

	// New Flow #START 

	// Select Unit (START)
	getUnit(input: string): Observable<any> {
		return this.http.get<any>(`${API_BASE}/get/unit?input=${input}`);
	}
	// Select Unit (END)

	// Get Customer By Unit ID (START)
	getCustomer(_id: string): Observable<any> {
		return this.http.get<any>(`${API_BASE}/get/customer/${_id}`);
	}
	// Get Customer By Unit ID (END)

	// Select City (START)
	getCity(input: string): Observable<any> {
		return this.http.get<any>(`${API_BASE}/get/city?input=${input}`);
	}
	// Select City (END)

	// New Flow #END

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	exportExcel() {
		return FileSaver.saveAs(`${API_CSV}`, "export-visitor.xlsx");
	}
}
