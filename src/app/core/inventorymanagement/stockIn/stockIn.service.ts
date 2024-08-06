import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { StockInModel } from './stockIn.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryStockInModel } from './querystockIn.model';

const API_BASE = `${environment.baseAPI}/api/inventorymanagement/stockin`;


@Injectable({
	providedIn: 'root'
})
export class StockInService {
	constructor(private http: HttpClient) {}
	getListStockIn(queryParams: QueryStockInModel): Observable<QueryResultsModel>{
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
	
	findStockInById(_id: string): Observable<StockInModel>{
		return this.http.get<StockInModel>(`${API_BASE}/${_id}`);
	}

	deleteStockIn(stockInId: string) {
		const url = `${API_BASE}/delete/${stockInId}`;
		return this.http.delete(url);
	}

	deleteFlagStockIn(visitor: StockInModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateStockIn(stockIn: StockInModel) {
		const url = `${API_BASE}/edit/${stockIn._id}`;
		return this.http.patch(url, stockIn);
	}
	
	createStockIn(stockIn: StockInModel): Observable<StockInModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<StockInModel>(`${API_BASE}/add`, stockIn, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/export/xlsx`, "export-stockIn.xlsx");
	}
}
