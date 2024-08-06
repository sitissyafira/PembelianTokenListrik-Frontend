import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AdModel } from './ad.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryResultsModel} from '../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryAdModel } from './queryad.model';

const API_FLOOR_URL = `${environment.baseAPI}/api/asset/deprecitiaion`;
const API_CSV = `${environment.baseAPI}/api/excel/assetDepreciation/export`;




@Injectable({
	providedIn: 'root'
})
export class AdService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListAd(queryParams: QueryAdModel): Observable<QueryResultsModel>{
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
		
		const url = `${API_FLOOR_URL}/list?${params}`;
		return this.http.get<QueryResultsModel>(url, { headers: httpHeaders });
	}

	
	findAdById(_id: string): Observable<AdModel>{
		return this.http.get<AdModel>(`${API_FLOOR_URL}/${_id}`);
	}
	
	deleteAd(adId: string) {
		const url = `${API_FLOOR_URL}/delete/${adId}`;
		return this.http.delete(url);
	}

	updateAd(ad: AdModel) {
		const url = `${API_FLOOR_URL}/edit/${ad._id}`;
		return this.http.patch(url, ad);
	}

	createAd(ad: AdModel): Observable<AdModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<AdModel>(`${API_FLOOR_URL}/add`, ad, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-ad.xlsx");
	}
}
