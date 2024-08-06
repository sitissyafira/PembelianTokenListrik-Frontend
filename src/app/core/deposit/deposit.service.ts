import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DepositModel} from './deposit.model';
import {QueryResultsModel} from '../_base/crud';
import {QueryDepositModel} from './querydeposit.model';
import * as FileSaver from 'file-saver';
import { environment } from '../../../environments/environment';

const API_Deposit_URL = `${environment.baseAPI}/api/deposit`;
const API_EXCEL = `${environment.baseAPI}/api/excel/deposit/export`;




@Injectable({
	providedIn: 'root'
})
export class DepositService {
	constructor(private http: HttpClient) {}
	// get list Deposit group
	getListDeposit(queryParams: QueryDepositModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_Deposit_URL + '/list?' + params,{ headers: httpHeaders });
	}
	deleteDeposit(depositId: string) {
		const url = `${API_Deposit_URL}/delete/${depositId}`;
		return this.http.delete(url);
	}
	exportExcel(){
		return FileSaver.saveAs(`${API_EXCEL}`, "export-deposit.xlsx");
	}
	updateDeposit(deposit: DepositModel) {
		const url = `${API_Deposit_URL}/edit/${deposit._id}`;
		return this.http.patch(url, deposit);
	}
	createDeposit(deposit: DepositModel): Observable<DepositModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<DepositModel>(`${API_Deposit_URL}/add`, deposit, { headers: httpHeaders});
	}
	findDepositByParent(id: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_Deposit_URL}/parent/${id}`);
	}
	findDepositById(id: any): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_Deposit_URL}/${id}`);
	}

	generateDepositCode(): Observable<QueryResultsModel>{
		const url = `${API_Deposit_URL}/generatecode`;
		return this.http.get<QueryResultsModel>(url);
	}

	generateDepoOut(): Observable<QueryResultsModel>{
		const url = `${API_Deposit_URL}/generateoutcode`;
		return this.http.get<QueryResultsModel>(url);
	}

	findDepositByIdPlain(id: any): Observable<any>{
		return this.http.get<any>(`${API_Deposit_URL}/${id}`);
	}
	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}
}
