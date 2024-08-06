import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { GasTransactionModel } from './transaction.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryResultsModel} from '../../_base/crud';

import * as FileSaver from 'file-saver';
import {HttpParams} from '@angular/common/http';
import { QueryGasTransactionModel } from './querytransaction.model';


const API_WATER_TRANSACTION_URL = `${environment.baseAPI}/api/gas/transaksi`;
const API_GAS_EXPORT_URL = `${environment.baseAPI}/api/excel/export/gas/consumption`;





@Injectable({
	providedIn: 'root'
})
export class GasTransactionService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListGasTransaction(queryParams: QueryGasTransactionModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_WATER_TRANSACTION_URL}`);
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
		return this.http.get<QueryResultsModel>(API_WATER_TRANSACTION_URL + '?' + params,{ headers: httpHeaders });
	}


	getListGasUnPost(queryParams: QueryGasTransactionModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_WATER_TRANSACTION_URL}`);
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
		return this.http.get<QueryResultsModel>(API_WATER_TRANSACTION_URL + '/unpost?' + params,{ headers: httpHeaders });
	}
	

	postingAll(gasTransaction : GasTransactionModel){
		const url = `${API_WATER_TRANSACTION_URL}` + '/posting';
		return this.http.patch(url, gasTransaction);
	}

	deleteGasTransaction(gasTransactionId: string) {
		const url = `${API_WATER_TRANSACTION_URL}/delete/${gasTransactionId}`;
		return this.http.delete(url);
	}


	getGasTransactionUnit(unitId: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_WATER_TRANSACTION_URL}/unit/${unitId}`);
	}


	updateGasTransaction(gasTransaction: GasTransactionModel) {
		const url = `${API_WATER_TRANSACTION_URL}/edit/${gasTransaction._id}`;
		return this.http.patch(url, gasTransaction);
	}
	createGasTransaction(gasTransaction: GasTransactionModel): Observable<GasTransactionModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<GasTransactionModel>(`${API_WATER_TRANSACTION_URL}/add`, gasTransaction, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_GAS_EXPORT_URL}`, "export-gas-consumption.xlsx");
	}
}
