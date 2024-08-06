import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { TaxModel } from './tax.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryTaxModel } from './querytax.model';

const API_BASE = `${environment.baseAPI}/api/tax`;


@Injectable({
	providedIn: 'root'
})
export class TaxService {
	constructor(private http: HttpClient) {}
	getListTax(queryParams: QueryTaxModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			search : queryParams.search,
			pageNumber : queryParams.pageNumber,
			limit : queryParams.limit
		}
		let params = new URLSearchParams();
		for (let key in options) {
			if (key === 'search' && !options[key]) continue
			params.set(key, options[key])

		}
		const url = `${API_BASE}/list?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}
	
	findTaxById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	deleteTax(taxId: string) {
		const url = `${API_BASE}/delete/${taxId}`;
		return this.http.delete(url);
	}

	deleteFlagTax(visitor: TaxModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateTax(tax: TaxModel) {
		const url = `${API_BASE}/edit/${tax._id}`;
		return this.http.patch(url, tax);
	}
	
	createTax(tax: TaxModel): Observable<TaxModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<TaxModel>(`${API_BASE}/add`, tax, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	
	// exportExcel(){
	// 	return FileSaver.saveAs(`${API_CSV}`, "export-tax.xlsx");
	// }
}
