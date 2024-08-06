import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { LeaseContractModel } from './lease.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel } from '../../_base/crud';

import { HttpParams } from '@angular/common/http';
import * as FileSaver from 'file-saver';
import { QueryleaseModel } from './querylease.model';

const API_EXCEL = `${environment.baseAPI}/api/excel/contract/lease/export`;
const API_RENTER_URL = `${environment.baseAPI}/api/contract/lease`;
const API_CONTRACT_URL = `${environment.baseAPI}/api/contract/ownership/unit`;





@Injectable({
	providedIn: 'root'
})
export class LeaseContractService {
	constructor(private http: HttpClient) { }

	exportExcel() {
		return FileSaver.saveAs(`${API_EXCEL}`, "export-contract-lease.xlsx");
	}

	// get list block group
	getListLeaseContract(queryParams: QueryleaseModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_RENTER_URL + '/list?' + params, { headers: httpHeaders });
	}

	findLeaseContractByParent(_id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_RENTER_URL}/parent/${_id}`);
	}

	findLeaseContractByUnit(_id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_RENTER_URL}/unit/${_id}`);
	}

	generateLeaseCode(customerID: string): Observable<QueryResultsModel> {
		const url = `${API_RENTER_URL}/generate/${customerID}`;
		return this.http.get<QueryResultsModel>(url);
	}

	getContractByUnit(customerID: string): Observable<any> {
		const url = `${API_CONTRACT_URL}/${customerID}`;
		return this.http.get<any>(url);
	}

	findLeaseById(id: string): Observable<any> {
		return this.http.get<any>(`${API_RENTER_URL}/${id}`);
	}




	deleteLeaseContract(leasecontractId: string) {
		const url = `${API_RENTER_URL}/delete/${leasecontractId}`;
		return this.http.delete(url);
	}
	updateLeaseContract(leasecontract: LeaseContractModel) {
		const url = `${API_RENTER_URL}/edit/${leasecontract._id}`;
		return this.http.patch(url, leasecontract);
	}
	createLeaseContract(leasecontract: LeaseContractModel): Observable<LeaseContractModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<LeaseContractModel>(`${API_RENTER_URL}/add`, leasecontract, { headers: httpHeaders });
	}
	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}
}
