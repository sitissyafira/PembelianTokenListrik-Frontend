import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { JourVoidModel } from './jourVoid.model';
import { QueryResultsModel } from '../../_base/crud';
import { QueryJourVoidModel } from './queryjourVoid.model';
import * as FileSaver from 'file-saver';
import { environment } from '../../../../environments/environment';

const API_JourVoid_URL = `${environment.baseAPI}/api/jourVoid`;
const API_EXCEL = `${environment.baseAPI}/api/excel/jourVoid/export`;
const API_BASE = `${environment.baseAPI}/api/jourVoid`;

@Injectable({
	providedIn: 'root'
})
export class JourVoidService {
	constructor(private http: HttpClient) { }
	// get list JourVoid group
	getListJourVoid(queryParams: any): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}

		// params.set("param", JSON.stringify(queryParams));
		const url = `${API_BASE}/listJourVoid?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getAllNum(queryParams: any): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<any>(`${API_BASE}/listNum?${params}`, { headers: httpHeaders });
	}

	getListFalseJourVoid(queryParams: QueryJourVoidModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_JourVoid_URL + '/falselist?' + params, { headers: httpHeaders });
	}
	deleteJourVoid(jourVoidId: string) {
		const url = `${API_JourVoid_URL}/delete/${jourVoidId}`;
		return this.http.delete(url);
	}
	exportExcel() {
		return FileSaver.saveAs(`${API_EXCEL}`, "export-jourVoid.xlsx");
	}
	updateJourVoid(jourVoid: JourVoidModel) {
		const url = `${API_JourVoid_URL}/edit/${jourVoid._id}`;
		return this.http.patch(url, jourVoid);
	}
	createJourVoid(jourVoid: JourVoidModel): Observable<JourVoidModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<JourVoidModel>(`${API_JourVoid_URL}/add`, jourVoid, { headers: httpHeaders });
	}
	findJourVoidByParent(id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_JourVoid_URL}/parent/${id}`);
	}


	findJourVoidById(id: any): Observable<any> {
		return this.http.get<any>(`${API_JourVoid_URL}/${id}`);
	}

	viewJourVoidById(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<any>(`${API_BASE}/viewJourVoid?${params}`);
	}

	downloadJourVoidById(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<any>(`${API_BASE}/downloadPDF?${params}`);
	}

	generateJourVoidCode(): Observable<QueryResultsModel> {
		const url = `${API_JourVoid_URL}/generate/jourVoid`;
		return this.http.get<QueryResultsModel>(url);
	}

	generateARCard(): Observable<JourVoidModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<JourVoidModel>(`${API_BASE}/generate`, { headers: httpHeaders });
	}

	findJourVoidByIdPlain(id: any): Observable<any> {
		return this.http.get<any>(`${API_JourVoid_URL}/${id}`);
	}

	// ========================= VOID BILLING # START =========================
	deleteJourVoiding(dataSend) {
		const dataReq = {
			reasonDel: dataSend.reasonDel,
			updateBy: dataSend.updateBy,
			descriptionDelete: dataSend.descriptionDelete,
			type: dataSend.type,
		}

		const url = `${API_BASE}/delete/${dataSend._id}`;

		const req = new HttpRequest('DELETE', `${url}`, dataReq, {
			reportProgress: true,
			responseType: 'json'
		});

		return this.http.request(req);
	}
	// ========================= VOID BILLING # END =========================

	/**
	 * Export Sample Import
	 * @returns 
	 */
	exportExample(filter) {
		return FileSaver.saveAs(`${API_BASE}/export/sample?startDate=${filter.startDate}&endDate=${filter.endDate}&unit=${filter.unit}&statusValue=${filter.statusValue}&statusValueFeature=${filter.statusValueFeature}`, "export-journalvoid-sample.xlsx");
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
