import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { StockProductModel } from './stockProduct.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryStockProductModel } from './querystockProduct.model';

const API_BASE = `${environment.baseAPI}/api/inventorymanagement/productlist`;


@Injectable({
	providedIn: 'root'
})
export class StockProductService {
	constructor(private http: HttpClient) {}
	getListStockProduct(queryParams: QueryStockProductModel): Observable<QueryResultsModel>{
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
	
	findStockProductById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	

	deleteStockProduct(stockProductId: string) {
		const url = `${API_BASE}/delete/${stockProductId}`;
		return this.http.delete(url);
	}

	deleteFlagStockProduct(visitor: StockProductModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateStockProduct(stockProduct: StockProductModel) {
		const url = `${API_BASE}/edit/${stockProduct._id}`;
		return this.http.patch(url, stockProduct);
	}
	
	createStockProduct(stockProduct: StockProductModel): Observable<StockProductModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<StockProductModel>(`${API_BASE}/add`, stockProduct, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-stockProduct.xlsx");
	}
}
