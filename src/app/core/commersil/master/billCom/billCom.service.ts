import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BillComModel } from './billCom.model';
import { environment } from '../../../../../environments/environment';
import { QueryResultsModel} from '../../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryBillComModel } from './querybillCom.model';

const API_BASE = `${environment.baseAPI}/api/commersil/billcom`;

@Injectable({
	providedIn: 'root'
})
export class BillComService {
	constructor(private http: HttpClient) {}
	getListBillCom(queryParams: QueryBillComModel): Observable<QueryResultsModel>{
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
	
	findBillComById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_BASE}/${_id}`);
	}
	

	deleteBillCom(billComId: string) {
		const url = `${API_BASE}/delete/${billComId}`;
		return this.http.delete(url);
	}

	deleteFlagBillCom(visitor: BillComModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateBillCom(billCom: BillComModel) {
		const url = `${API_BASE}/edit/${billCom._id}`;
		return this.http.patch(url, billCom);
	}
	
	createBillCom(billCom: BillComModel): Observable<BillComModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<BillComModel>(`${API_BASE}/add`, billCom, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-billCom.xlsx");
	}

	generateCodeBillCom(): Observable<QueryResultsModel>{
		const url = `${API_BASE}/generatenumberbill`;
		return this.http.get<QueryResultsModel>(url);
	}
}
