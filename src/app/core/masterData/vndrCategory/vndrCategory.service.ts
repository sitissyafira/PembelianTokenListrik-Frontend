import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { VndrCategoryModel } from './vndrCategory.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryVndrCategoryModel } from './queryvndrCategory.model';

const API_BASE = `${environment.baseAPI}/api/vendorcategory`;


@Injectable({
	providedIn: 'root'
})
export class VndrCategoryService {
	constructor(private http: HttpClient) {}
	getListVndrCategory(queryParams: QueryVndrCategoryModel): Observable<QueryResultsModel>{
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
	
	findVndrCategoryById(_id: string): Observable<VndrCategoryModel>{
		return this.http.get<VndrCategoryModel>(`${API_BASE}/${_id}`);
	}
	deleteVndrCategory(vndrCategoryId: string) {
		const url = `${API_BASE}/delete/${vndrCategoryId}`;
		return this.http.delete(url);
	}

	deleteFlagVndrCategory(visitor: VndrCategoryModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateVndrCategory(vndrCategory: VndrCategoryModel) {
		const url = `${API_BASE}/edit/${vndrCategory._id}`;
		return this.http.patch(url, vndrCategory);
	}
	
	createVndrCategory(vndrCategory: VndrCategoryModel): Observable<VndrCategoryModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<VndrCategoryModel>(`${API_BASE}/add`, vndrCategory, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-vendorCategory.xlsx");
	}
}
