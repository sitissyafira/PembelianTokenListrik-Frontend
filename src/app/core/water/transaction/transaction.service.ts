import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { WaterTransactionModel } from './transaction.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { QueryResultsModelUpd } from '../../_base/crud-upd';

import * as FileSaver from 'file-saver';
import { HttpParams } from '@angular/common/http';
import { QueryWaterTransactionModel } from './querytransaction.model';


const API_WATER_TRANSACTION_URL = `${environment.baseAPI}/api/water/transaksi`;
const API_WATER_EXPORT_URL = `${environment.baseAPI}/api/excel/export/water/consumption`;

const API_POWER_RATE_URL_NEW = `${environment.baseAPI}/api/water/transaksi`;

@Injectable({
	providedIn: 'root'
})
export class WaterTransactionService {
	constructor(private http: HttpClient) { }
	// get list block group
	getListWaterTransaction(queryParams: QueryWaterTransactionModel): Observable<QueryResultsModelUpd> {
		// return this.http.get<QueryResultsModelUpd>(`${API_WATER_TRANSACTION_URL}`);
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
		return this.http.get<QueryResultsModelUpd>(API_WATER_TRANSACTION_URL + '/list?' + params, { headers: httpHeaders });
	}


	getListWaterUnPost(queryParams: QueryWaterTransactionModel): Observable<QueryResultsModelUpd> {
		// return this.http.get<QueryResultsModelUpd>(`${API_WATER_TRANSACTION_URL}`);
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
		return this.http.get<QueryResultsModelUpd>(API_WATER_TRANSACTION_URL + '/unpost?' + params, { headers: httpHeaders });
	}


	postingAll(waterTransaction: WaterTransactionModel) {
		const url = `${API_WATER_TRANSACTION_URL}` + '/posting';
		return this.http.patch(url, waterTransaction);
	}

	deleteWaterTransaction(waterTransactionId: string) {
		const url = `${API_WATER_TRANSACTION_URL}/delete/${waterTransactionId}`;
		return this.http.delete(url);
	}
	getWaterTransactionUnit(unitId: string): Observable<QueryResultsModelUpd> {
		return this.http.get<QueryResultsModelUpd>(`${API_WATER_TRANSACTION_URL}/unit/${unitId}`);
	}


	findWaterbillById(_id: string): Observable<any> {
		return this.http.get<any>(`${API_WATER_TRANSACTION_URL}/${_id}`);
	}

	updateWaterTransaction(waterTransaction: WaterTransactionModel) {
		const url = `${API_WATER_TRANSACTION_URL}/edit/${waterTransaction._id}`;
		return this.http.patch(url, waterTransaction);
	}
	createWaterTransaction(waterTransaction: WaterTransactionModel): Observable<WaterTransactionModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<WaterTransactionModel>(`${API_WATER_TRANSACTION_URL}/add`, waterTransaction, { headers: httpHeaders });
	}

	/**
	 * This API OLD (old)
	 * @param _id 
	 * @param queryParams 
	 * @returns 
	 */
	getWaterTransactionBill(_id: string, queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<any>(`${API_WATER_TRANSACTION_URL}/${_id}?${params}`, { headers: httpHeaders });
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
	exportExcel(queryParams: QueryWaterTransactionModel): Observable<QueryResultsModelUpd> {
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
		return FileSaver.saveAs(`${API_WATER_EXPORT_URL}?startDate=${queryParams.fromDate}&endDate=${queryParams.toDate}`, `export-water-consumption-${queryParams.fromDate}to${queryParams.toDate}.xlsx`);
	}
}
