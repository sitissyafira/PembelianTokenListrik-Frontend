import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,} from 'rxjs';
import { BillLogModel } from './billLog.model';
import { environment } from '../../../../../environments/environment';
import { QueryResultsModel} from '../../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryBillLogModel } from './querybillLog.model';

const API_BASE = `${environment.baseAPI}/api/billinglog`;
// const API_CSV = `${environment.baseAPI}/api/excel/acctype/export`;

@Injectable({
	providedIn: 'root'
})
export class BillLogService {
	constructor(private http: HttpClient) {}
	getListBillLog(queryParams: QueryBillLogModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			search : queryParams.search,
			page : queryParams.page,
			limit : queryParams.limit
		}
		let params = new URLSearchParams();
		for (let key in options) {
			if (key === 'search' && !options[key]) continue
			params.set(key, options[key])

		}
		const url = `${API_BASE}/listAll?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	findBillLogById(_id: string): Observable<BillLogModel>{
		return this.http.get<BillLogModel>(`${API_BASE}/findby/${_id}`);
	}
	
	deleteBillLog(billLogId: string) {
		const url = `${API_BASE}/delete/${billLogId}`;
		return this.http.delete(url);
	}
	updateBillLog(billLog: BillLogModel) {
		const url = `${API_BASE}/edit/${billLog._id}`;
		return this.http.patch(url, billLog);
	}
	createBillLog(billLog: BillLogModel): Observable<BillLogModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<BillLogModel>(`${API_BASE}/add`, billLog, { headers: httpHeaders});
	}

	// exportExcel(){
	// 	return FileSaver.saveAs(`${API_CSV}`, "export-billLog.xlsx");
	// }
}
