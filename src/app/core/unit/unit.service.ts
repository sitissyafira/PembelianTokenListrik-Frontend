import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { UnitModel } from './unit.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QueryResultsModel } from '../_base/crud';
import { QueryUnitModel } from './queryunit.model';
import * as FileSaver from 'file-saver';

const API_FLOOR_URL = `${environment.baseAPI}/api/unit`;
const API_GALON_URL = `${environment.baseAPI}/api/galon/transaction`;
const API_EXCEL = `${environment.baseAPI}/api/excel/unit/export`;

@Injectable({
	providedIn: 'root'
})
export class UnitService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListUnit(queryParams: QueryUnitModel): Observable<QueryResultsModel> {
		// return this.http.get<QueryResultsModel>(`${API_FLOOR_URL}`);
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		// let params = new HttpParams({
		// 	fromObject: queryParams
		// });
		// @ts-ignore
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_FLOOR_URL + '/list?' + params, { headers: httpHeaders });
	}

	getCustomerUnit(unit: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_FLOOR_URL}/customer/${unit}`);
	}

	getUnitById(id: any): Observable<any> {
		return this.http.get<any>(`${API_FLOOR_URL}/${id}`);
	}

	findUnitById(id: any): Observable<any> {
		return this.http.get<any>(`${API_FLOOR_URL}/unit/${id}`);
	}

	findUnitByParent(_id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_FLOOR_URL}/parent/${_id}`);
	}

	getDataUnitForParking(queryParams: any): Observable<QueryResultsModel> {
		return this.http.get<any>(`${API_FLOOR_URL}/list/parking`);
	}

	getDataUnitForGalon(queryParams: any): Observable<QueryResultsModel> {
		return this.http.get<any>(`${API_GALON_URL}/list/unit`);
	}
	getDataCustomerForGalon(queryParams: any): Observable<QueryResultsModel> {
		return this.http.get<any>(`${API_GALON_URL}/list/tenant`);
	}
	getDataBrandForGalon(queryParams: any): Observable<QueryResultsModel> {
		return this.http.get<any>(`${API_GALON_URL}/list/rate`);
	}

	getDataUnitForSearchUnit(queryParams: any): Observable<QueryResultsModel> {
		console.log(queryParams, "queryParans Add Park");

		const httpHeaders = new HttpHeaders();
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));


		return this.http.get<any>(`${API_FLOOR_URL}/list/searchunit?${params}`, { headers: httpHeaders });
	}


	findUnitforPwr(_id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_FLOOR_URL}/parentpwr/${_id}`);
	}

	findUnitforWtr(_id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_FLOOR_URL}/parentwtr/${_id}`);
	}


	findUnitforContract(_id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_FLOOR_URL}/owncontract/${_id}`);
	}

	findUnitforContractLease(_id: string): Observable<any> {
		return this.http.get<any>(`${API_FLOOR_URL}/leasecontract/${_id}`);
	}

	findUnitforContractRenter(_id: string): Observable<any> {
		return this.http.get<any>(`${API_FLOOR_URL}/rentercontract/${_id}`);
	}

	exportExcel() {
		return FileSaver.saveAs(`${API_EXCEL}`, "export-unit.xlsx");
	}

	downloadTemplate() {
		// return FileSaver.saveAs(`${API_EXCEL}?example=true`, "import-unit.xlsx");
		return this.http.get(`${API_EXCEL}?example=true`, { responseType: 'blob' });
	}

	deleteUnit(unitId: string) {
		const url = `${API_FLOOR_URL}/delete/${unitId}`;
		return this.http.delete(url);
	}
	updateUnit(unit: UnitModel) {
		const url = `${API_FLOOR_URL}/edit/${unit._id}`;
		return this.http.patch(url, unit);
	}
	createUnit(unit: UnitModel): Observable<UnitModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<UnitModel>(`${API_FLOOR_URL}/add`, unit, { headers: httpHeaders });
	}

	getListUnitByName(queryParams: QueryUnitModel): Observable<QueryResultsModel> {
		// return this.http.get<QueryResultsModel>(`${API_FLOOR_URL}`);
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		// let params = new HttpParams({
		// 	fromObject: queryParams
		// });
		// @ts-ignore
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_FLOOR_URL + '/list-bast?' + params, { headers: httpHeaders });
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
