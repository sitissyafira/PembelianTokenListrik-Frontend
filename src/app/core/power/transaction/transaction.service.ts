import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PowerTransactionModel } from './transaction.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { QueryResultsModelUpd } from '../../_base/crud-upd';
import { QueryParamsModel } from '../../_base/crud/models/query-models/query-params.model';
import { QueryPowerTransactionModel } from './querytransaction.model';
import * as FileSaver from 'file-saver';
import { HttpParams } from '@angular/common/http';

const API_POWER_TRANSACTION_URL = `${environment.baseAPI}/api/power/transaksi`;
const API_POWER_EXPORT_URL = `${environment.baseAPI}/api/excel/export/electricity/consumption`;

const API_POWER_RATE_URL_NEW = `${environment.baseAPI}/api/power/transaksi`;


@Injectable({
	providedIn: 'root'
})
export class PowerTransactionService {
	constructor(private http: HttpClient) { }
	// get list block group

	getListPowerTransaction(queryParams: QueryPowerTransactionModel): Observable<QueryResultsModelUpd> {
		// return this.http.get<QueryResultsModelUpd>(`${API_POWER_TRANSACTION_URL}`);
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
		return this.http.get<QueryResultsModelUpd>(API_POWER_TRANSACTION_URL + '/list?' + params, { headers: httpHeaders });
	}

	getListPowerTransactionUnpost(queryParams: QueryPowerTransactionModel): Observable<QueryResultsModelUpd> {
		// return this.http.get<QueryResultsModelUpd>(`${API_POWER_TRANSACTION_URL}`);
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
		return this.http.get<QueryResultsModelUpd>(API_POWER_TRANSACTION_URL + '/unpost?' + params, { headers: httpHeaders });
	}

	deletePowerTransaction(powerTransactionId: string) {
		const url = `${API_POWER_TRANSACTION_URL}/delete/${powerTransactionId}`;
		return this.http.delete(url);
	}

	getPowerTransactionUnit(unitId: string): Observable<QueryResultsModelUpd> {
		return this.http.get<QueryResultsModelUpd>(`${API_POWER_TRANSACTION_URL}/unit/${unitId}`);
	}

	updatePowerTransaction(powerTransaction: PowerTransactionModel) {
		const url = `${API_POWER_TRANSACTION_URL}/edit/${powerTransaction._id}`;
		return this.http.patch(url, powerTransaction);
	}
	createPowerTransaction(powerTransaction: PowerTransactionModel): Observable<PowerTransactionModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PowerTransactionModel>(`${API_POWER_TRANSACTION_URL}/add`, powerTransaction, { headers: httpHeaders });
	}

	findPowbillById(_id: string): Observable<any> {
		return this.http.get<any>(`${API_POWER_TRANSACTION_URL}/${_id}`);
	}

	/**
	 *  Old API (old)
	 * @param _id 
	 * @param queryParams 
	 * @returns 
	 */
	getPowerTransactionBill(_id: string, queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<any>(`${API_POWER_TRANSACTION_URL}/${_id}?${params}`, { headers: httpHeaders });
	}

	/* =================== Delete Image =================== */
	/**
 * @param _id to find by id data transaction
 * @param condition decide which one to delete, web/mobile
 * @returns 
 */
	deleteImage(_id: string, condition: string) {
		const paramsObj = { _id, imgFrom: condition }

		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(paramsObj)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}

		const url = `${API_POWER_RATE_URL_NEW}/image/delete?${params}`;
		return this.http.delete(url, { headers: httpHeaders });
	}


	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}


	exportExcel(queryParams: QueryPowerTransactionModel): Observable<QueryResultsModelUpd> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		let options = {
			phistorytopupam: JSON.stringify(queryParams)
		}
		for (let key in options) {
			params.set(key, options[key]);
		}

		console.log(queryParams);

		const sehistorytopupch = queryParams.filter


		// return this.http.get<QueryResultsModelUpd>(`${API_HISTORY_TRANSAKSI}/gethistory/date?fromDate=${queryParams.fromDate}&toDate=${queryParams.toDate}&page=${queryParams.pageNumber}&limit=${queryParams.limit}`, { headers: httpHeaders });
		return FileSaver.saveAs(`${API_POWER_EXPORT_URL}?startDate=${queryParams.fromDate}&endDate=${queryParams.toDate}`, `export-power-consumption-${queryParams.fromDate}to${queryParams.toDate}.xlsx`);
	}


}
