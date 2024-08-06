import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ProductCategoryModel } from './productCategory.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryProductCategoryModel } from './queryproductCategory.model';

const API_BASE = `${environment.baseAPI}/api/masterproductcategory`;


@Injectable({
	providedIn: 'root'
})
export class ProductCategoryService {
	constructor(private http: HttpClient) {}
	getListProductCategory(queryParams: QueryProductCategoryModel): Observable<QueryResultsModel>{
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
	
	findProductCategoryById(_id: string): Observable<ProductCategoryModel>{
		return this.http.get<ProductCategoryModel>(`${API_BASE}/${_id}`);
	}
	deleteProductCategory(productCategoryId: string) {
		const url = `${API_BASE}/delete/${productCategoryId}`;
		return this.http.delete(url);
	}

	deleteFlagProductCategory(visitor: ProductCategoryModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateProductCategory(productCategory: ProductCategoryModel) {
		const url = `${API_BASE}/update/${productCategory._id}`;
		return this.http.patch(url, productCategory);
	}
	
	createProductCategory(productCategory: ProductCategoryModel): Observable<ProductCategoryModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ProductCategoryModel>(`${API_BASE}/add`, productCategory, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	
	// exportExcel(){
	// 	return FileSaver.saveAs(`${API_CSV}`, "export-productCategory.xlsx");
	// }
}
