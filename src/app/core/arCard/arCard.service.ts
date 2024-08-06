import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ArCardModel } from './arCard.model';
import { QueryResultsModel } from '../_base/crud';
import { QueryArCardModel } from './queryarCard.model';
import * as FileSaver from 'file-saver';
import { environment } from '../../../environments/environment';

const API_ArCard_URL = `${environment.baseAPI}/api/arCard`;
const API_EXCEL = `${environment.baseAPI}/api/excel/arCard/export`;
const API_BASE = `${environment.baseAPI}/api/arCard`;

@Injectable({
	providedIn: 'root'
})
export class ArCardService {
	constructor(private http: HttpClient) { }
	// get list ArCard group
	getListArCard(queryParams: any): Observable<QueryResultsModel> {
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
		const url = `${API_BASE}/listArCard?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	getAllUnit(queryParams: any): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<any>(`${API_BASE}/listUnit?${params}`, { headers: httpHeaders });
	}

	getListFalseArCard(queryParams: QueryArCardModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_ArCard_URL + '/falselist?' + params, { headers: httpHeaders });
	}
	deleteArCard(arCardId: string) {
		const url = `${API_ArCard_URL}/delete/${arCardId}`;
		return this.http.delete(url);
	}
	exportExcel() {
		return FileSaver.saveAs(`${API_EXCEL}`, "export-arCard.xlsx");
	}
	updateArCard(arCard: ArCardModel) {
		const url = `${API_ArCard_URL}/edit/${arCard._id}`;
		return this.http.patch(url, arCard);
	}
	createArCard(arCard: ArCardModel): Observable<ArCardModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ArCardModel>(`${API_ArCard_URL}/add`, arCard, { headers: httpHeaders });
	}
	findArCardByParent(id: string): Observable<QueryResultsModel> {
		return this.http.get<QueryResultsModel>(`${API_ArCard_URL}/parent/${id}`);
	}


	findArCardById(id: any): Observable<any> {
		return this.http.get<any>(`${API_ArCard_URL}/${id}`);
	}

	viewArCardById(queryParams): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<any>(`${API_BASE}/viewArCard?${params}`);
	}

	downloadArCardById(queryParams): Observable<any> {
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

	generateArCardCode(): Observable<QueryResultsModel> {
		const url = `${API_ArCard_URL}/generate/arCard`;
		return this.http.get<QueryResultsModel>(url);
	}

	generateARCard(): Observable<ArCardModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<ArCardModel>(`${API_BASE}/generate`, { headers: httpHeaders });
	}

	findArCardByIdPlain(id: any): Observable<any> {
		return this.http.get<any>(`${API_ArCard_URL}/${id}`);
	}

	/**
	 * Export Sample Import
	 * @returns 
	 */
	exportExample() {
		return FileSaver.saveAs(`${API_BASE}/import/sample`, "import-arcard-sample.xlsx");
	}
	/**
	 * Export ArCard
	 * @returns 
	 */
	exportArCard(query) {
		const headers = new HttpHeaders();
		headers.set("Content-Type", "application/json");

		const url = `${API_BASE}/exportArCard?queryYear=${query}`;
		return this.http.get(url, {
			headers,
			responseType: "arraybuffer",
		});

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
