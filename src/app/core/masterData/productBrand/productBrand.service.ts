import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ProductBrandModel } from './productBrand.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryProductBrandModel } from './queryproductBrand.model';

const API_BASE = `${environment.baseAPI}/api/masterproductbrand`;


@Injectable({
	providedIn: 'root'
})
export class ProductBrandService {
	constructor(private http: HttpClient) {}
	getListProductBrand(queryParams: QueryProductBrandModel): Observable<QueryResultsModel>{
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
	
	findProductBrandById(_id: string): Observable<ProductBrandModel>{
		return this.http.get<ProductBrandModel>(`${API_BASE}/${_id}`);
	}

	findProductBrandByCategory(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/brand/${_id}`);
	}



	deleteProductBrand(productBrandId: string) {
		const url = `${API_BASE}/delete/${productBrandId}`;
		return this.http.delete(url);
	}

	deleteFlagProductBrand(visitor: ProductBrandModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateProductBrand(productBrand: ProductBrandModel) {
		const url = `${API_BASE}/update/${productBrand._id}`;
		return this.http.patch(url, productBrand);
	}
	
	createProductBrand(productBrand: ProductBrandModel): Observable<ProductBrandModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ProductBrandModel>(`${API_BASE}/add`, productBrand, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-productBrand.xlsx");
	}
}
