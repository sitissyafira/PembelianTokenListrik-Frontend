import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { TicketModel } from './ticket.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QueryResultsModel } from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryTicketModel } from './queryticket.model';

const API_RATING_URL = `${environment.baseAPI}/api/rating`;
const API_FLOOR_URL = `${environment.baseAPI}/api/ticket`;
const API_CSV = `${environment.baseAPI}/api/excel/ticket/export`;
const API_CSV_RATING = `${environment.baseAPI}/api/excel/ticket/rating/export`;
const API_TICKET_LIST = `${environment.baseAPI}/api/ticketlist`
const API_TICKET_RATING = `${environment.baseAPI}/api/rating`


@Injectable({
	providedIn: 'root'
})
export class TicketService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListTicket(queryParams: QueryTicketModel): Observable<QueryResultsModel> {
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

	// getListOpenTicket(queryParams: QueryTicketModel): Observable<QueryResultsModel>{
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

	getWfsTicket(queryParams: QueryTicketModel): Observable<QueryResultsModel> {
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

	getOpenTicket(queryParams: QueryTicketModel): Observable<QueryResultsModel> {
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

	getWfcTicket(queryParams: QueryTicketModel): Observable<QueryResultsModel> {
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

	getScheduledTicket(queryParams: QueryTicketModel): Observable<QueryResultsModel> {
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

	getRescheduledTicket(queryParams: QueryTicketModel): Observable<QueryResultsModel> {
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

	getTicketRating(queryParams: QueryTicketModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		const params = JSON.stringify({ ...queryParams })

		return this.http.get<QueryResultsModel>(`${API_TICKET_RATING}/?query=${params}`, { headers: httpHeaders });
	}

	getDoneTicket(queryParams: QueryTicketModel): Observable<QueryResultsModel> {
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

	getListTicketSpv(queryParams: QueryTicketModel): Observable<QueryResultsModel> {
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

	// Add API get All Ticket filtered

	// 1. Ticket All (Reject)
	getRejectTicket(queryParams: QueryTicketModel): Observable<QueryResultsModel> {
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

	// 2. Ticket All (Waiting For Schedule Survey)
	getWaitSurveyTicket(queryParams: QueryTicketModel): Observable<QueryResultsModel> {
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

	// 3. Ticket All (Schedule Survey)
	getScheduleSurveyTicket(queryParams: QueryTicketModel): Observable<QueryResultsModel> {
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

	// 4. Ticket All (Survey Done)
	getSurveyDoneTicket(queryParams: QueryTicketModel): Observable<QueryResultsModel> {
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

	generateTicketCode(): Observable<QueryResultsModel> {
		const url = `${API_FLOOR_URL}/generateTicketCode`;
		return this.http.get<QueryResultsModel>(url);
	}


	findTicketById(_id: string): Observable<TicketModel> {
		return this.http.get<TicketModel>(`${API_TICKET_LIST}/find/${_id}`);
	}


	deleteTicket(ticketId: string) {
		const url = `${API_FLOOR_URL}/${ticketId}`;
		return this.http.delete(url);
	}

	deleteRating(ticketId: string) {
		const url = `${API_RATING_URL}/delete/${ticketId}`;
		return this.http.delete(url);
	}


	// Update Is Read
	updateIsRead(_id) {
		const url = `${API_FLOOR_URL}/isread/${_id}`;

		return this.http.patch<any>(url, { _id });
	}


	updateTicket(ticket: TicketModel) {
		const url = `${API_FLOOR_URL}/${ticket._id}`;
		return this.http.patch(url, ticket);
	}


	createTicket(ticket: TicketModel): Observable<TicketModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<TicketModel>(`${API_FLOOR_URL}/add`, ticket, { headers: httpHeaders });
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
