import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CategoryModel } from './category.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryResultsModel} from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryCategoryModel } from './querycategory.model';

const API_FLOOR_URL = `${environment.baseAPI}/api/category`;
const API_CSV = `${environment.baseAPI}/api/excel/category/export`;

@Injectable({
	providedIn: 'root'
})
export class CategoryService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListCategory(queryParams: QueryCategoryModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		// let options = {
		// 	param: JSON.stringify(queryParams)
		// }
		let params = new URLSearchParams();
		// for (let key in options) {
		// 	params.set(key, options[key])
		// }

		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(API_FLOOR_URL + '?' + params,{ headers: httpHeaders });
	}

	
	findCategoryById(_id: string): Observable<CategoryModel>{
		return this.http.get<CategoryModel>(`${API_FLOOR_URL}/${_id}`);
	}
	deleteCategory(categoryId: string) {
		const url = `${API_FLOOR_URL}/delete/${categoryId}`;
		return this.http.delete(url);
	}
	updateCategory(category: CategoryModel) {
		const url = `${API_FLOOR_URL}/edit/${category._id}`;
		return this.http.patch(url, category);
	}
	createCategory(category: CategoryModel): Observable<CategoryModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<CategoryModel>(`${API_FLOOR_URL}/add`, category, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	generateCategoryCode(): Observable<QueryResultsModel>{
		const url = `${API_FLOOR_URL}/generate/code`;
		return this.http.get<QueryResultsModel>(url);
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-category.xlsx");
	}
}
