import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { VendorModel } from './vendor.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryVendorModel } from './queryvendor.model';

const API_BASE = `${environment.baseAPI}/api/vendor`;


@Injectable({
	providedIn: 'root'
})
export class VendorService {
	constructor(private http: HttpClient) {}
	getListVendor(queryParams: QueryVendorModel): Observable<QueryResultsModel>{
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

	getListVendorByProduct(queryParams: QueryVendorModel): Observable<QueryResultsModel>{
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
		const url = `${API_BASE}/listbyproduct?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}
	
	findVendorById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	deleteVendor(vendorId: string) {
		const url = `${API_BASE}/delete/${vendorId}`;
		return this.http.delete(url);
	}

	deleteFlagVendor(visitor: VendorModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	getVendorNo(): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_BASE}/generate`);
	}

	updateVendor(vendor: VendorModel) {
		const url = `${API_BASE}/edit/${vendor._id}`;
		return this.http.patch(url, vendor);
	}
	
	createVendor(vendor: VendorModel): Observable<VendorModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<VendorModel>(`${API_BASE}/add`, vendor, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-vendor.xlsx");
	}
}
