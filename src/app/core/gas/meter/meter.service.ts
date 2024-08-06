import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { GasMeterModel } from './meter.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryResultsModel} from '../../_base/crud';
import { QueryGasMeterModel } from './querymeter.model';
import * as FileSaver from 'file-saver';

const API_EXCEL = `${environment.baseAPI}/api/excel/gasmas/export`;
const API_POWER_RATE_URL = `${environment.baseAPI}/api/gas/master`;




@Injectable({
	providedIn: 'root'
})
export class GasMeterService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListGasMeter(queryParams: QueryGasMeterModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_POWER_RATE_URL}`);
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
		return this.http.get<QueryResultsModel>(API_POWER_RATE_URL + '/list?' + params,{ headers: httpHeaders });
	}
	getGasMeter(id){
		return this.http.get<any>(`${API_POWER_RATE_URL}/${id}`);
	}
	deleteGasMeter(gasMeterId: string) {
		const url = `${API_POWER_RATE_URL}/delete/${gasMeterId}`;
		return this.http.delete(url);
	}
	updateGasMeter(gasMeter: GasMeterModel) {
		const url = `${API_POWER_RATE_URL}/edit/${gasMeter._id}`;
		return this.http.patch(url, gasMeter);
	}
	createGasMeter(gasMeter: GasMeterModel): Observable<GasMeterModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<GasMeterModel>(`${API_POWER_RATE_URL}/add`, gasMeter, { headers: httpHeaders});
	}
	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_EXCEL}`, "export-gasmeter.xlsx");
	}

}
