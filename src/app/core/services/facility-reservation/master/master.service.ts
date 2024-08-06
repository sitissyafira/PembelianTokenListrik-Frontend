import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MasterModel, FacilityModelMaster } from './master.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { QueryParamsModel, QueryResultsModel } from '../../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryMasterModel } from './querymaster.model';

const API_BASE_MASTER = `${environment.baseAPI}/api/facility/schedule`;
const API_BASE_FACILITY_MASTER = `${environment.baseAPI}/api/facility/master`;

const API_BASE = `${environment.baseAPI}/api/facility/schedule`;

const API_CSV = `${environment.baseAPI}/api/excel/packagemanagement/export`;

@Injectable({
	providedIn: 'root'
})
export class MasterService {
	constructor(private http: HttpClient) { }

	findMasterById(_id: string): Observable<MasterModel> {
		return this.http.get<MasterModel>(`${API_BASE}/${_id}`);
	}

	updateIsRead(_id: string): Observable<MasterModel> {
		return this.http.patch<MasterModel>(`${API_BASE}/update/isread/${_id}`, { data: 'tester' });
	}

	generateCode(): Observable<MasterModel> {
		return this.http.get<MasterModel>(`${API_BASE}/generate/packagecode`);
	}

	getAllCategory(): Observable<MasterModel> {
		return this.http.get<MasterModel>(`${API_BASE}/category/list/all`);
	}

	deleteMaster(masterId: string) {
		const url = `${API_BASE}/deleteflag/${masterId}`;
		return this.http.delete(url);
	}

	deleteMasterNew(masterId: any) {
		const url = `${API_BASE}/delete/${masterId}`;
		return this.http.delete(url);
	}

	deleteFlagMaster(master: MasterModel) {
		const url = `${API_BASE}/deleteflag/${master._id}`;
		return this.http.patch(url, master);
	}

	updateMaster(master) {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		const url = `${API_BASE}/edit/${master._id}`;
		return this.http.patch(url, master.data, { headers: httpHeaders });
	}
	createMaster(master: MasterModel): Observable<MasterModel> {
		return this.http.post<MasterModel>(`${API_BASE}/add`, master);
	}

	// =========================  Master Data Facility Reservation  =========================  //

	getListMaster(queryParams: QueryMasterModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}

		const url = `${API_BASE_MASTER}/getall?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getByIdMaster(_id: string): Observable<any> {
		return this.http.get<any>(`${API_BASE_MASTER}/get/${_id}`);
	}

	getChooseMasterMaster(input): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		const url = `${API_BASE_FACILITY_MASTER}/getall?input=${input}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	deleteChooseMasterMaster(masterId: string) {
		const url = `${API_BASE_FACILITY_MASTER}/delete/${masterId}`;
		return this.http.delete(url);
	}

	createChooseMasterMaster(master: any): Observable<any> {
		return this.http.post<any>(`${API_BASE_FACILITY_MASTER}/add`, master);
	}

	createMasterMaster(master: FacilityModelMaster): Observable<FacilityModelMaster> {
		return this.http.post<FacilityModelMaster>(`${API_BASE_MASTER}/add`, master);
	}

	updateMasterMaster(master) {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		const url = `${API_BASE_MASTER}/update/${master._id}`;
		return this.http.patch(url, master, { headers: httpHeaders });
	}

	deleteMasterMaster(masterId: string) {
		const url = `${API_BASE_MASTER}/delete/${masterId}`;
		return this.http.delete(url);
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
		return FileSaver.saveAs(`${API_BASE_MASTER}/export`, "export-master-facility.xlsx");
	}
}
