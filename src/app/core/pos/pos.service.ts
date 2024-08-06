import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PosModel } from './pos.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QueryResultsModel } from '../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryPosModel } from './querypos.model';
import { QueryBankModel } from '../masterData/bank/bank/querybank.model';

const API_EMONEY_URL = `${environment.baseAPI}/api/emoney`;
const API_PAYMTD_URL = `${environment.baseAPI}/api/paymentmethod`;
const API_BANK_URL = `${environment.baseAPI}/api/bank`;
const API_POS = `${environment.baseAPI}/api/cashierPayment`;
const API_POS_RECORD = `${environment.baseAPI}/api/cashierRecord`;
const API_BILLING = `${environment.baseAPI}/api/billing`;
const API_GALON = `${environment.baseAPI}/api/galon`;
const API_TICKET = `${environment.baseAPI}/api/ticket`;


@Injectable({
	providedIn: 'root'
})
export class PosService {
	constructor(private http: HttpClient) { }

	getUnitAll(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}

		return this.http.get<any>(`${API_POS}/get/unit?${params}`, { headers: httpHeaders });
	}

	// Get Bank Method
	getListBank(queryParams: QueryBankModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(API_BANK_URL + '/list?' + params, { headers: httpHeaders });
	}

	// Get Bank Method
	getPaymentSelection(): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.get<QueryResultsModel>(API_PAYMTD_URL + '/getlist', { headers: httpHeaders });
	}

	// Get Bank Method
	getEmoneyList(): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.get<QueryResultsModel>(API_EMONEY_URL + '/getlist', { headers: httpHeaders });
	}

	// Get Billing outstanding by unit
	getBillingByUnit(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		let params = new URLSearchParams();
		params.set("params", JSON.stringify(queryParams));

		return this.http.get<any>(`${API_POS}/outstanding/billing?${params}`, { headers: httpHeaders });
	}

	addPosCashierPayment(data): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		return this.http.post<any>(`${API_POS}/create`, data, { headers: httpHeaders });
	}

	addPosCashierRecord(data): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		return this.http.post<any>(`${API_POS_RECORD}/create`, data, { headers: httpHeaders });
	}

	// Get Data closing Control
	getClosingControl(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}

		return this.http.get<any>(`${API_POS_RECORD}/closingcontrol?${params}`, { headers: httpHeaders });
	}

	// Update Cashier Record
	updatePosCashierRecord(_id: string, data): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		return this.http.patch<any>(`${API_POS_RECORD}/update/${_id}`, data, { headers: httpHeaders });
	}

	// Testing PDF Print
	generatePDF(id): Observable<any> {

		const headers = new HttpHeaders();
		headers.set('Content-Type', 'application/json');

		const url = `${environment.baseAPI}/api/ticket/exportpdf/${id}`;

		return this.http.get(url, {
			headers,
			responseType: "arraybuffer"
		});
	}

	// Get Payment History
	getPaymentHistory(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}

		return this.http.get<any>(`${API_POS}/payment/history?${params}`, { headers: httpHeaders });
	}

	// Template Billing
	templateBilling(id): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.get<any>(`${API_BILLING}/send-billing/${id}`, { headers: httpHeaders });
	}

	// Template Galon
	templateGalon(id): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.get<any>(`${API_GALON}/transaction/send-galon/${id}`, { headers: httpHeaders });
	}

	// Template Galon
	templateTicket(id): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.get<any>(`${API_TICKET}/sendpdfticket/${id}`, { headers: httpHeaders });
	}

	// generate CODE POS
	generateCode(): Observable<any> {
		return this.http.get<any>(`${API_POS}/generate/cashierno`);
	}

	// Template ( INVOICE, GALON, TICKET )
	templatePrintReceipt(id): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.get<any>(`${API_POS}/print/${id}`, { headers: httpHeaders });
	}

}
