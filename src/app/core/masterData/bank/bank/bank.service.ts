import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BankModel } from './bank.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {QueryResultsModel} from '../../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryBankModel } from './querybank.model';

const API_BANK_URL = `${environment.baseAPI}/api/bank`;
const API_CSV = `${environment.baseAPI}/api/excel/bank/export`;

@Injectable({
	providedIn: 'root'
})
export class BankService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListBank(queryParams: QueryBankModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(API_BANK_URL + '/list?' + params,{ headers: httpHeaders });
	}

	
	findBankById(_id: string): Observable<BankModel>{
		return this.http.get<BankModel>(`${API_BANK_URL}/${_id}`);
	}

	deleteBank(bankId: string) {
		const url = `${API_BANK_URL}/delete/${bankId}`;
		return this.http.delete(url);
	}
	updateBank(bank: BankModel) {
		const url = `${API_BANK_URL}/edit/${bank._id}`;
		return this.http.patch(url, bank);
	}
	createBank(bank: BankModel): Observable<BankModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<BankModel>(`${API_BANK_URL}/add`, bank, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-bank.xlsx");
	}
}
