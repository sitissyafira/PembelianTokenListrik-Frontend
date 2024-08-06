import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { InvoiceModel} from './invoice.model';
import {QueryResultsModel} from '../_base/crud';
import {QueryInvoiceModel} from './queryinvoice.model';
import * as FileSaver from 'file-saver';
import { environment } from '../../../environments/environment';

const API_Invoice_URL = `${environment.baseAPI}/api/invoice`;
const API_EXCEL = `${environment.baseAPI}/api/excel/invoice/export`;



@Injectable({
	providedIn: 'root'
})
export class InvoiceService {
	constructor(private http: HttpClient) {}
	// get list Invoice group
	getListInvoice(queryParams: QueryInvoiceModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_Invoice_URL + '/list?' + params,{ headers: httpHeaders });
	}
	getListFalseInvoice(queryParams: QueryInvoiceModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_Invoice_URL + '/falselist?' + params,{ headers: httpHeaders });
	}
	deleteInvoice(invoiceId: string) {
		const url = `${API_Invoice_URL}/delete/${invoiceId}`;
		return this.http.delete(url);
	}
	exportExcel(){
		return FileSaver.saveAs(`${API_EXCEL}`, "export-invoice.xlsx");
	}
	updateInvoice(invoice: InvoiceModel) {
		const url = `${API_Invoice_URL}/edit/${invoice._id}`;
		return this.http.patch(url, invoice);
	}
	createInvoice(invoice: InvoiceModel): Observable<InvoiceModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<InvoiceModel>(`${API_Invoice_URL}/add`, invoice, { headers: httpHeaders});
	}
	findInvoiceByParent(id: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_Invoice_URL}/parent/${id}`);
	}


	findInvoiceById(id: any): Observable<any>{
		return this.http.get<any>(`${API_Invoice_URL}/${id}`);
	}

	generateInvoiceCode(): Observable<QueryResultsModel>{
		const url = `${API_Invoice_URL}/generate/invoice`;
		return this.http.get<QueryResultsModel>(url);
	}

	findInvoiceByIdPlain(id: any): Observable<any>{
		return this.http.get<any>(`${API_Invoice_URL}/${id}`);
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
