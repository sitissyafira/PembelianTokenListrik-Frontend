import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DebitNoteModel } from './debitNote.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { QueryResultsModel } from '../../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryDebitNoteModel } from './querydebitNote.model';
import { query } from 'chartist';

const API_BASE = `${environment.baseAPI}/api/debitnote`;
const API_CSV = `${environment.baseAPI}/api/excel/export/debitnote`;

@Injectable({
	providedIn: 'root'
})
export class DebitNoteService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListDebitNote(queryPdebitNoteams: QueryDebitNoteModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		let options = {
			param: JSON.stringify(queryPdebitNoteams)
		}
		for (let key in options) {
			params.set(key, options[key]);
		}

		return this.http.get<QueryResultsModel>(API_BASE + '/list?' + params, { headers: httpHeaders });
	}

	getListDebitNoteTotal(queryPdebitNoteams: QueryDebitNoteModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		let options = {
			param: JSON.stringify(queryPdebitNoteams)
		}
		for (let key in options) {
			params.set(key, options[key]);
		}



		return this.http.get<QueryResultsModel>(API_BASE + '/list?' + params, { headers: httpHeaders });
	}


	findDebitNoteById(_id: string): Observable<DebitNoteModel> {

		return this.http.get<DebitNoteModel>(`${API_BASE}/${_id}`);
	}

	deleteDebitNote(debitNoteId: string) {
		const url = `${API_BASE}/delete/${debitNoteId}`;
		return this.http.delete(url);
	}
	updateDebitNote(debitNote: DebitNoteModel) {
		const url = `${API_BASE}/update/${debitNote._id}`;
		return this.http.patch(url, debitNote);
	}

	createDebitNote(debitNote: DebitNoteModel): Observable<DebitNoteModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<DebitNoteModel>(`${API_BASE}/add`, debitNote, { headers: httpHeaders });
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	exportExcel(_date) {
		return FileSaver.saveAs(`${API_CSV}?startDate=${_date.startDate}&endDate=${_date.endDate}`, `export-journal-debitnote-${_date.startDate}-${_date.endDate}.xlsx`);
	}
}
