import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RenterContractModel } from './renter.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel } from '../../_base/crud';

import { HttpParams } from '@angular/common/http';
import * as FileSaver from 'file-saver';
import { QueryrenterModel } from './queryrenter.model';

const API_EXCEL = `${environment.baseAPI}/api/excel/contract/renter/export`;
const API_RENTER_URL = `${environment.baseAPI}/api/contract/renter`;
const API_CONTRACT_URL = `${environment.baseAPI}/api/contract/ownership/unit`;





@Injectable({
	providedIn: 'root'
})
export class RenterContractService {
	constructor(private http: HttpClient) { }

	exportExcel(query) {
		return FileSaver.saveAs(`${API_EXCEL}?name=${query.name}`, "export-contract-renter.xlsx");
	}

	// get list block group
	getListRenterContract(queryParams: QueryrenterModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_RENTER_URL + '/list?'+'name=checkin&' + params, { headers: httpHeaders });
	}
	getListRenterContractCheckIn(queryParams: QueryrenterModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_RENTER_URL + '/list?'+'name=checkin&' + params, { headers: httpHeaders });
	}
	getListRenterContractCheckOut(queryParams: QueryrenterModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_RENTER_URL + '/list?'+'name=checkout&' + params, { headers: httpHeaders });
	}

	findRenterContractByParent(_id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_RENTER_URL}/parent/${_id}`);
	}

	findRenterContractByUnit(_id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_RENTER_URL}/unit/${_id}`);
	}

	generateRenterCode(customerID: string): Observable<QueryResultsModel> {
		const url = `${API_RENTER_URL}/generate/${customerID}`;
		return this.http.get<QueryResultsModel>(url);
	}

	getContractByUnit(customerID: string): Observable<any> {
		const url = `${API_CONTRACT_URL}/${customerID}`;
		return this.http.get<any>(url);
	}
	getConsumptionContractByUnit(id: string): Observable<any> {
		const API_RENTER = `${environment.baseAPI}/api/contract/renter`;
		return this.http.get<any>(`${API_RENTER}/last/consumption?params={"filter":"${id}"}`);
	}

	findRenterById(id: string): Observable<any> {
		return this.http.get<any>(`${API_RENTER_URL}/${id}`);
	}




	deleteRenterContract(rentercontractId: string) {
		const url = `${API_RENTER_URL}/delete/${rentercontractId}`;
		return this.http.delete(url);
	}
	updateRenterContract(rentercontract: RenterContractModel) {
		const url = `${API_RENTER_URL}/edit/${rentercontract._id}`;
		return this.http.patch(url, rentercontract);
	}
	createRenterContract(rentercontract: RenterContractModel): Observable<RenterContractModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<RenterContractModel>(`${API_RENTER_URL}/add`, rentercontract, { headers: httpHeaders });
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
