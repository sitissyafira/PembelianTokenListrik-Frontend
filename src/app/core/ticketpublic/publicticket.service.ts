import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PublicTicketModel } from './publicticket.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QueryResultsModel } from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryPublicTicketModel } from './querypublicticket.model';

const API_RATING_URL = `${environment.baseAPI}/api/ratingPublic`;
const API_FLOOR_URL = `${environment.baseAPI}/api/ticketPublic`;
const API_CSV = `${environment.baseAPI}/api/excel/ticket/export`;
const API_CSV_RATING = `${environment.baseAPI}/api/excel/ticket/rating/export`;
const API_TICKET_LIST = `${environment.baseAPI}/api/ticketPubliclist`
const API_TICKET_RATING = `${environment.baseAPI}/api/ratingPublic`


@Injectable({
	providedIn: 'root'
})
export class PublicTicketService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListPublicTicket(queryParams: QueryPublicTicketModel): Observable<QueryResultsModel> {
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
		return this.http.get<QueryResultsModel>(API_TICKET_LIST + '/alllist?' + params, { headers: httpHeaders });
	}

	// getListOpenPublicTicket(queryParams: QueryPublicTicketModel): Observable<QueryResultsModel>{
	// 	// return this.http.get<QueryResultsModel>(`${API_FLOOR_URL}`);
	// 	const httpHeaders = new HttpHeaders();
	// 	httpHeaders.set('Content-Type', 'application/json');
	// 	// let params = new HttpParams({
	// 	// 	fromObject: queryParams
	// 	// });
	// 	// @ts-ignore
	// 	let options = {
	// 		param: JSON.stringify(queryParams)
	// 	}
	// 	let params = new URLSearchParams();
	// 	for (let key in options) {
	// 		params.set(key, options[key])
	// 	}
	// 	return this.http.get<QueryResultsModel>(API_TICKET_LIST + '/openticket?' + params,{ headers: httpHeaders });
	// }

	getWfsPublicTicket(queryParams: QueryPublicTicketModel): Observable<QueryResultsModel> {
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
		return this.http.get<QueryResultsModel>(API_TICKET_LIST + '/wfsticket?' + params, { headers: httpHeaders });
	}

	getOpenPublicTicket(queryParams: QueryPublicTicketModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_TICKET_LIST + '/openticket?' + params, { headers: httpHeaders });
	}

	getWfcPublicTicket(queryParams: QueryPublicTicketModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_TICKET_LIST + '/wfcticket?' + params, { headers: httpHeaders });
	}

	getScheduledPublicTicket(queryParams: QueryPublicTicketModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_TICKET_LIST + '/scheduled?' + params, { headers: httpHeaders });
	}

	getRescheduledPublicTicket(queryParams: QueryPublicTicketModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_TICKET_LIST + '/rescheduled?' + params, { headers: httpHeaders });
	}

	getPublicTicketRating(queryParams: QueryPublicTicketModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		const params = JSON.stringify({ ...queryParams })

		return this.http.get<QueryResultsModel>(`${API_TICKET_RATING}/?query=${params}`, { headers: httpHeaders });
	}

	getDonePublicTicket(queryParams: QueryPublicTicketModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_TICKET_LIST + '/done?' + params, { headers: httpHeaders });
	}

	getListPublicTicketSpv(queryParams: QueryPublicTicketModel): Observable<QueryResultsModel> {
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
		return this.http.get<QueryResultsModel>(API_TICKET_LIST + '/allspv?' + params, { headers: httpHeaders });
	}

	// Add API get All PublicTicket filtered

	// 1. PublicTicket All (Reject)
	getRejectPublicTicket(queryParams: QueryPublicTicketModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_TICKET_LIST + '/done?' + params, { headers: httpHeaders });
	}

	// 2. PublicTicket All (Waiting For Schedule Survey)
	getWaitSurveyPublicTicket(queryParams: QueryPublicTicketModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_TICKET_LIST + '/done?' + params, { headers: httpHeaders });
	}

	// 3. PublicTicket All (Schedule Survey)
	getScheduleSurveyPublicTicket(queryParams: QueryPublicTicketModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_TICKET_LIST + '/done?' + params, { headers: httpHeaders });
	}

	// 4. PublicTicket All (Survey Done)
	getSurveyDonePublicTicket(queryParams: QueryPublicTicketModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_TICKET_LIST + '/done?' + params, { headers: httpHeaders });
	}

	generatePublicTicketCode(): Observable<QueryResultsModel> {
		const url = `${API_FLOOR_URL}/generateTicketCode`;
		return this.http.get<QueryResultsModel>(url);
	}


	findPublicTicketById(_id: string): Observable<PublicTicketModel> {
		return this.http.get<PublicTicketModel>(`${API_TICKET_LIST}/find/${_id}`);
	}


	deletePublicTicket(publicTicketId: string) {
		const url = `${API_FLOOR_URL}/${publicTicketId}`;
		return this.http.delete(url);
	}

	deleteRating(publicTicketId: string) {
		const url = `${API_RATING_URL}/delete/${publicTicketId}`;
		return this.http.delete(url);
	}


	// Update Is Read
	updateIsRead(_id) {
		const url = `${API_FLOOR_URL}/isread/${_id}`;

		return this.http.patch<any>(url, { _id });
	}


	updatePublicTicket(publicTicket: PublicTicketModel) {
		const url = `${API_FLOOR_URL}/${publicTicket._id}`;
		return this.http.patch(url, publicTicket);
	}


	createPublicTicket(publicTicket: PublicTicketModel): Observable<PublicTicketModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PublicTicketModel>(`${API_FLOOR_URL}/add`, publicTicket, { headers: httpHeaders });
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
		return FileSaver.saveAs(`${API_CSV}`, "export-ticket.xlsx");
	}
	exportExcelRating() {
		return FileSaver.saveAs(`${API_CSV_RATING}`, "export-rating-ticket.xlsx");
	}
}
