import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DeliveryorderModel } from './deliveryorder.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QueryResultsModel } from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryDeliveryorderModel } from './querydeliveryorder.model';

const API_FLOOR_URL = `${environment.baseAPI}/api/do`;
const API_CSV = `${environment.baseAPI}/api/excel/do/export`;
const API_LIST_URL = `${environment.baseAPI}/api/listDO`;

@Injectable({
	providedIn: 'root'
})
export class DeliveryorderService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListDeliveryorder(queryParams: QueryDeliveryorderModel): Observable<QueryResultsModel> {
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
		return this.http.get<QueryResultsModel>(API_LIST_URL + '/listDO?' + params, { headers: httpHeaders });
	}

	getListVisit(queryParams: QueryDeliveryorderModel): Observable<QueryResultsModel> {
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
		return this.http.get<QueryResultsModel>(API_LIST_URL + '/listVisitDO?' + params, { headers: httpHeaders });
	}

	getListFixed(queryParams: QueryDeliveryorderModel): Observable<QueryResultsModel> {
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
		return this.http.get<QueryResultsModel>(API_LIST_URL + '/listFixedDO?' + params, { headers: httpHeaders });
	}




	findDeliveryorderById(_id: string): Observable<DeliveryorderModel> {
		return this.http.get<DeliveryorderModel>(`${API_FLOOR_URL}/${_id}`);
	}


	findDObyTicketID(_id: string): Observable<any> {
		return this.http.get<any>(`${API_LIST_URL}/getdo/${_id}`);
	}


	deleteDeliveryorder(deliveryorderId: string) {
		const url = `${API_FLOOR_URL}/${deliveryorderId}`;
		return this.http.delete(url);
	}

	updateDeliveryorder(deliveryorder: DeliveryorderModel) {
		const url = `${API_FLOOR_URL}/${deliveryorder._id}`;

		return this.http.patch(url, deliveryorder);
	}


	updateDeliveryorderUpd(deliveryorder: DeliveryorderModel, _id: string) {
		const url = `${API_FLOOR_URL}/${_id}`;

		return this.http.patch(url, deliveryorder);
	}

	// Update Is Read
	updateIsRead(_id) {
		const url = `${API_FLOOR_URL}/isread/${_id}`;

		return this.http.patch<any>(url, { _id });
	}

	createDeliveryorder(deliveryorder: DeliveryorderModel): Observable<DeliveryorderModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<DeliveryorderModel>(`${API_FLOOR_URL}`, deliveryorder, { headers: httpHeaders });
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
		return FileSaver.saveAs(`${API_CSV}`, "export-deliveryorder.xlsx");
	}
}
