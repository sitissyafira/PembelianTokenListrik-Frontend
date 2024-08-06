import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { StockOutModel } from './stockOut.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryStockOutModel } from './querystockOut.model';

const API_EXCEL = `${environment.baseAPI}/api/excel/stockout/export`;
const API_BASE = `${environment.baseAPI}/api/inventorymanagement/stockOut`;


@Injectable({
	providedIn: 'root'
})
export class StockOutService {
	constructor(private http: HttpClient) {}
	getListStockOut(queryParams: QueryStockOutModel): Observable<QueryResultsModel>{
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

	findStockOutById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}


	deleteStockOut(stockOutId: string) {
		const url = `${API_BASE}/delete/${stockOutId}`;
		return this.http.delete(url);
	}

	deleteFlagStockOut(visitor: StockOutModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateStockOut(stockOut: StockOutModel) {
		const url = `${API_BASE}/edit/${stockOut._id}`;
		return this.http.patch(url, stockOut);
	}

	createStockOut(stockOut: StockOutModel): Observable<StockOutModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<StockOutModel>(`${API_BASE}/add`, stockOut, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}

	exportExcel(){
		//return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-stockOut.xlsx");
		return FileSaver.saveAs(`${API_EXCEL}`, "export-stockout.xlsx");
	}


	generateCode(): Observable<QueryResultsModel>{
		const url = `${API_BASE}/code/generate`;
		return this.http.get<QueryResultsModel>(url);
	}
}
