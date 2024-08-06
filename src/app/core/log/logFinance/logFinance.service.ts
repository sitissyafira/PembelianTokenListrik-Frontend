import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { LogFinanceModel } from './logFinance.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryLogFinanceModel } from './querylogFinance.model';

const API_BASE = `${environment.baseAPI}/api/logfinance`;
const API_CSV = `${environment.baseAPI}/api/excel/acctype/export`;

@Injectable({
	providedIn: 'root'
})
export class LogFinanceService {
	constructor(private http: HttpClient) {}
	
	getListLogFinanceAR(queryParams: QueryLogFinanceModel): Observable<QueryResultsModel>{
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
		
		const url = `${API_BASE}/list/accreceive?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}


	getListLogFinanceAP(queryParams: QueryLogFinanceModel): Observable<QueryResultsModel>{
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
		
		const url = `${API_BASE}/list/accpayment?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}



	getListLogFinancePR(queryParams: QueryLogFinanceModel): Observable<QueryResultsModel>{
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
		
		const url = `${API_BASE}/list/pr?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getListLogFinancePO(queryParams: QueryLogFinanceModel): Observable<QueryResultsModel>{
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
		
		const url = `${API_BASE}/list/po?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getListLogFinanceQU(queryParams: QueryLogFinanceModel): Observable<QueryResultsModel>{
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
		
		const url = `${API_BASE}/list/quotation?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}


	getListLogFinancePD(queryParams: QueryLogFinanceModel): Observable<QueryResultsModel>{
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
		
		const url = `${API_BASE}/list/product?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getListLogFinanceSI(queryParams: QueryLogFinanceModel): Observable<QueryResultsModel>{
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
		
		const url = `${API_BASE}/list/stockin?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}





	findLogFinanceById(_id: string): Observable<LogFinanceModel>{
		return this.http.get<LogFinanceModel>(`${API_BASE}/${_id}`);
	}

	updateLogFinance(logFinance: LogFinanceModel) {
		const url = `${API_BASE}/edit/${logFinance._id}`;
		return this.http.patch(url, logFinance);
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
		return FileSaver.saveAs(`${API_CSV}`, "export-logFinance.xlsx");
	}
}
