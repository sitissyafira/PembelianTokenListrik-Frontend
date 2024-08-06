import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CurrencyModel } from './currency.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryCurrencyModel } from './querycurrency.model';

const API_BASE = `${environment.baseAPI}/api/currency`;


@Injectable({
	providedIn: 'root'
})
export class CurrencyService {
	constructor(private http: HttpClient) {}
	getListCurrency(queryParams: QueryCurrencyModel): Observable<QueryResultsModel>{
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
	
	findCurrencyById(_id: string): Observable<CurrencyModel>{
		return this.http.get<CurrencyModel>(`${API_BASE}/${_id}`);
	}
	deleteCurrency(currencyId: string) {
		const url = `${API_BASE}/delete/${currencyId}`;
		return this.http.delete(url);
	}

	deleteFlagCurrency(visitor: CurrencyModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateCurrency(currency: CurrencyModel) {
		const url = `${API_BASE}/edit/${currency._id}`;
		return this.http.patch(url, currency);
	}
	
	createCurrency(currency: CurrencyModel): Observable<CurrencyModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<CurrencyModel>(`${API_BASE}/add`, currency, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-currency.xlsx");
	}
}
