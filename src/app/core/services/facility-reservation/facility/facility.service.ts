import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FacilityModel, FacilityModelFacility } from './facility.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { QueryParamsModel, QueryResultsModel } from '../../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryFacilityModel } from './queryfacility.model';

const API_BASE_FACILITY_RESERVATION = `${environment.baseAPI}/api/facility/reservation`;
const API_BASE = `${environment.baseAPI}/api/facility/schedule`;
const API_CSV = `${environment.baseAPI}/api/excel/packagemanagement/export`;

@Injectable({
	providedIn: 'root'
})
export class FacilityService {
	constructor(private http: HttpClient) { }

	findFacilityById(_id: string): Observable<FacilityModel> {
		return this.http.get<FacilityModel>(`${API_BASE}/${_id}`);
	}

	updateIsRead(_id: string): Observable<FacilityModel> {
		return this.http.patch<FacilityModel>(`${API_BASE}/update/isread/${_id}`, { data: 'tester' });
	}

	generateCode(): Observable<FacilityModel> {
		return this.http.get<FacilityModel>(`${API_BASE}/generate/packagecode`);
	}

	getAllCategory(): Observable<FacilityModel> {
		return this.http.get<FacilityModel>(`${API_BASE}/category/list/all`);
	}

	deleteFacility(facilityId: string) {
		const url = `${API_BASE}/deleteflag/${facilityId}`;
		return this.http.delete(url);
	}

	deleteFacilityNew(facilityId: any) {
		const url = `${API_BASE}/delete/${facilityId}`;
		return this.http.delete(url);
	}

	deleteFlagFacility(facility: FacilityModel) {
		const url = `${API_BASE}/deleteflag/${facility._id}`;
		return this.http.patch(url, facility);
	}

	updateFacility(facility) {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		const url = `${API_BASE}/edit/${facility._id}`;
		return this.http.patch(url, facility.data, { headers: httpHeaders });
	}
	createFacility(facility: FacilityModel): Observable<FacilityModel> {
		return this.http.post<FacilityModel>(`${API_BASE}/add`, facility);
	}

	// =========================  Facility Reservation  =========================  //

	getListFacilityReservation(queryParams: QueryFacilityModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}

		const url = `${API_BASE_FACILITY_RESERVATION}/getall?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	updateFacilityReservation(id, facility) {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		const url = `${API_BASE_FACILITY_RESERVATION}/update/${id}`;
		return this.http.patch(url, facility, { headers: httpHeaders });
	}

	deleteFacilityReservation(facilityId: string) {
		const url = `${API_BASE_FACILITY_RESERVATION}/delete/${facilityId}`;
		return this.http.delete(url);
	}

	generateCodeFacility(): Observable<FacilityModel> {
		return this.http.get<FacilityModel>(`${API_BASE_FACILITY_RESERVATION}/generatecode`);
	}

	createFacilityReservation(facility: FacilityModelFacility): Observable<FacilityModelFacility> {
		return this.http.post<FacilityModelFacility>(`${API_BASE_FACILITY_RESERVATION}/add`, facility);
	}

	getByIdFacilityReservation(_id: string): Observable<any> {
		return this.http.get<any>(`${API_BASE_FACILITY_RESERVATION}/get/${_id}`);
	}


	getTenantInformation(_id: string): Observable<any> {
		return this.http.get<any>(`${API_BASE_FACILITY_RESERVATION}/gettenantandphone/${_id}`);
	}

	getTimeReservation(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}

		const url = `${API_BASE_FACILITY_RESERVATION}/getdetailfacility?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getUnitFacility(input): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		const url = `${API_BASE_FACILITY_RESERVATION}/getunit?input=${input}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	getDateFacility(input): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		const url = `${API_BASE_FACILITY_RESERVATION}/getfacilitybydate?input=${input}`;
		return this.http.get<any>(url, { headers: httpHeaders });
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
		return FileSaver.saveAs(`${API_BASE_FACILITY_RESERVATION}/export`, "export-facility.xlsx");
	}
}
