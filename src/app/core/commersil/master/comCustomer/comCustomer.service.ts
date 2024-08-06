import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ComCustomerModel } from './comCustomer.model';
import { environment } from '../../../../../environments/environment';
import { QueryResultsModel } from '../../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryComCustomerModel } from './querycomCustomer.model';

const API_BASE = `${environment.baseAPI}/api/commersil/mcustomer`;
const API_VA_TOKEN = `${environment.baseAPI}/api/vatoken`



@Injectable({
	providedIn: 'root'
})
export class ComCustomerService {
	constructor(private http: HttpClient) { }
	getListComCustomer(queryParams: QueryComCustomerModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			search: queryParams.search,
			pageNumber: queryParams.pageNumber,
			limit: queryParams.limit
		}
		let params = new URLSearchParams();
		for (let key in options) {
			if (key === 'search' && !options[key]) continue
			params.set(key, options[key])

		}
		const url = `${API_BASE}/list?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	findComCustomerById(_id: string): Observable<any> {
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}

	createVirtualAccount(comCustomer: ComCustomerModel, idCustomer: string): Observable<ComCustomerModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		console.log(comCustomer);

		const data = {
			cstmrId: idCustomer,
			isToken: comCustomer.isToken,
			isTenant: comCustomer.isTenant,
			va_ipl: comCustomer.va_ipl,
			va_water: comCustomer.va_water,
			va_power: comCustomer.va_power,
			va_utility: comCustomer.va_utility,
			va_gas: comCustomer.va_gas,
			va_parking: comCustomer.va_parking,
		}

		return this.http.post<ComCustomerModel>(`${API_VA_TOKEN}/create/comm`, data, { headers: httpHeaders });
	}

	updateVirtualAccount(ownershipcontract: ComCustomerModel, id: string): Observable<ComCustomerModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');

		let data = {
			cstmrId: ownershipcontract.cstmrId,
			isToken: ownershipcontract.isToken,
			isTenant: true,
			va_ipl: ownershipcontract.va_ipl,
			va_water: ownershipcontract.va_water,
			va_power: ownershipcontract.va_power,
			va_utility: ownershipcontract.va_utility,
			va_gas: ownershipcontract.va_gas,
			va_parking: ownershipcontract.va_parking,
		}

		const dataParse = JSON.stringify(data)

		console.log(id);


		return this.http.patch<ComCustomerModel>(`${API_VA_TOKEN}/update/${id}`, data, { headers: httpHeaders });
	}


	deleteComCustomer(comCustomerId: string) {
		const url = `${API_BASE}/delete/${comCustomerId}`;
		return this.http.delete(url);
	}

	deleteFlagComCustomer(visitor: ComCustomerModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateComCustomer(comCustomer: ComCustomerModel) {
		const url = `${API_BASE}/edit/${comCustomer._id}`;
		return this.http.patch(url, comCustomer);
	}

	createComCustomer(comCustomer: ComCustomerModel): Observable<ComCustomerModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ComCustomerModel>(`${API_BASE}/add`, comCustomer, { headers: httpHeaders });
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	exportExcel() {
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-comCustomer.xlsx");
	}
}
