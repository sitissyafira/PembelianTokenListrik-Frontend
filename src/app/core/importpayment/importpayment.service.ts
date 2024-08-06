import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ImportpaymentModel } from './importpayment.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QueryResultsModel } from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryImportpaymentModel } from './queryimportpayment.model';

const API_PPLBILL_URL = `${environment.baseAPI}/api/billing/paidpayment`;

@Injectable({
	providedIn: 'root'
})
export class ImportpaymentService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListPaidImport(queryParams: QueryImportpaymentModel): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		// params.set("param", JSON.stringify(queryParams));
		const url = `${API_PPLBILL_URL}/list?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	findRentalbillingById(_id: string): Observable<any> {
		return this.http.get<ImportpaymentModel>(`${API_PPLBILL_URL}/${_id}`);
	}
	deleteRentalbilling(rentalbillingId: string) {
		const url = `${API_PPLBILL_URL}/delete/${rentalbillingId}`;
		return this.http.delete(url);
	}
	updateRentalbilling(importpayment: ImportpaymentModel) {
		const url = `${API_PPLBILL_URL}/edit/${importpayment._id}`;
		return this.http.patch(url, importpayment);
	}

	createRentalbilling(importpayment: ImportpaymentModel): Observable<ImportpaymentModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ImportpaymentModel>(`${API_PPLBILL_URL}/add`, importpayment, { headers: httpHeaders });
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	generateCodeRentalBiling(): Observable<QueryResultsModel> {
		const url = `${API_PPLBILL_URL}/generate/CodeRentalBiling`;
		return this.http.get<QueryResultsModel>(url);
	}

	exportExcel() {
		return FileSaver.saveAs(`${API_PPLBILL_URL}/export`, "export-importpayment.xlsx");
	}
	exportExample() {
		return FileSaver.saveAs(`${API_PPLBILL_URL}/exportsample`, "template-import-importpayment.xlsx");
	}
	exportSuccess(date, _id) {
		return FileSaver.saveAs(`${API_PPLBILL_URL}/successImport?_id=${_id}`, "success-import-importpayment.xlsx");
	}
	exportFailed(date, _id) {
		return FileSaver.saveAs(`${API_PPLBILL_URL}/failedImport?_id=${_id}`, "failed-import-importpayment.xlsx");
	}
}
