import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PackagesModel } from './packages.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { QueryParamsModel, QueryResultsModel } from '../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryPackagesModel } from './querypackages.model';

// const API_BASE = `${environment.baseAPI}/api/acctype`;
const API_BASE = `${environment.baseAPI}/api/packagemanagement`;

const API_CSV = `${environment.baseAPI}/api/excel/packagemanagement/export`;

@Injectable({
	providedIn: 'root'
})
export class PackagesService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListPackages(queryParams: QueryPackagesModel): Observable<QueryResultsModel> {
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
		const url = `${API_BASE}/list?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getListLostFoundPackages(queryParams: QueryPackagesModel): Observable<QueryResultsModel> {
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
		const url = `${API_BASE}/list/lostfound?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	findPackagesById(_id: string): Observable<PackagesModel> {
		return this.http.get<PackagesModel>(`${API_BASE}/${_id}`);
	}

	updateIsRead(_id: string): Observable<PackagesModel> {
		return this.http.patch<PackagesModel>(`${API_BASE}/update/isread/${_id}`, { data: 'tester' });
	}

	generateCode(): Observable<PackagesModel> {
		return this.http.get<PackagesModel>(`${API_BASE}/generate/packagecode`);
	}

	getAllCategory(): Observable<PackagesModel> {
		return this.http.get<PackagesModel>(`${API_BASE}/category/list/all`);
	}

	deletePackages(packagesId: string) {
		const url = `${API_BASE}/deleteflag/${packagesId}`;
		return this.http.delete(url);
	}

	deletePackagesNew(packagesId: any) {
		const url = `${API_BASE}/delete/${packagesId}`;
		return this.http.delete(url);
	}

	deleteFlagPackages(packages: PackagesModel) {
		const url = `${API_BASE}/deleteflag/${packages._id}`;
		return this.http.patch(url, packages);
	}

	updatePackages(packages) {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		const url = `${API_BASE}/edit/${packages._id}`;
		return this.http.patch(url, packages.data, { headers: httpHeaders });
	}

	createPackages(packages: PackagesModel): Observable<PackagesModel> {
		// const httpHeaders = new HttpHeaders();
		// httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PackagesModel>(`${API_BASE}/add`, packages);
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	exportExcel() {
		return FileSaver.saveAs(`${API_CSV}`, "export-packages.xlsx");
	}
}
