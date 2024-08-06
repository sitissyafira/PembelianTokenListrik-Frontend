import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DepartmentModel } from './department.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryDepartmentModel } from './querydepartment.model';

const API_BASE = `${environment.baseAPI}/api/department`;

@Injectable({
	providedIn: 'root'
})
export class DepartmentService {
	constructor(private http: HttpClient) {}
	getListDepartment(queryParams: QueryDepartmentModel): Observable<QueryResultsModel>{
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
	
	findDepartmentById(_id: string): Observable<DepartmentModel>{
		return this.http.get<DepartmentModel>(`${API_BASE}/${_id}`);
	}
	deleteDepartment(departmentId: string) {
		const url = `${API_BASE}/delete/${departmentId}`;
		return this.http.delete(url);
	}

	deleteFlagDepartment(visitor: DepartmentModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateDepartment(department: DepartmentModel) {
		const url = `${API_BASE}/edit/${department._id}`;
		return this.http.patch(url, department);
	}
	
	createDepartment(department: DepartmentModel): Observable<DepartmentModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<DepartmentModel>(`${API_BASE}/add`, department, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-department.xlsx");
	}
}
