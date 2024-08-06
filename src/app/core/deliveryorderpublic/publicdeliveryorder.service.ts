import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PublicDeliveryorderModel } from './publicdeliveryorder.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QueryResultsModel } from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryPublicDeliveryorderModel } from './querypublicdeliveryorder.model';

const API_FLOOR_URL = `${environment.baseAPI}/api/doPublic`;
const API_CSV = `${environment.baseAPI}/api/excel/do/export`;
const API_LIST_URL = `${environment.baseAPI}/api/listDOPublic`;

@Injectable({
	providedIn: 'root'
})
export class PublicDeliveryorderService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListPublicDeliveryorder(queryParams: QueryPublicDeliveryorderModel): Observable<QueryResultsModel> {
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

	getListVisit(queryParams: QueryPublicDeliveryorderModel): Observable<QueryResultsModel> {
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

	getListFixed(queryParams: QueryPublicDeliveryorderModel): Observable<QueryResultsModel> {
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




	findPublicDeliveryorderById(_id: string): Observable<PublicDeliveryorderModel> {
		return this.http.get<PublicDeliveryorderModel>(`${API_FLOOR_URL}/${_id}`);
	}


	findDObyTicketID(_id: string): Observable<any> {
		return this.http.get<any>(`${API_LIST_URL}/getdo/${_id}`);
	}


	deletePublicDeliveryorder(publicDeliveryorderId: string) {
		const url = `${API_FLOOR_URL}/${publicDeliveryorderId}`;
		return this.http.delete(url);
	}

	updatePublicDeliveryorder(publicDeliveryorder: PublicDeliveryorderModel) {
		const url = `${API_FLOOR_URL}/${publicDeliveryorder._id}`;

		return this.http.patch(url, publicDeliveryorder);
	}


	updatePublicDeliveryorderUpd(publicDeliveryorder: PublicDeliveryorderModel, _id: string) {
		const url = `${API_FLOOR_URL}/${_id}`;

		return this.http.patch(url, publicDeliveryorder);
	}

	// Update Is Read
	updateIsRead(_id) {
		const url = `${API_FLOOR_URL}/isread/${_id}`;

		return this.http.patch<any>(url, { _id });
	}

	createPublicDeliveryorder(publicDeliveryorder: PublicDeliveryorderModel): Observable<PublicDeliveryorderModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PublicDeliveryorderModel>(`${API_FLOOR_URL}`, publicDeliveryorder, { headers: httpHeaders });
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
