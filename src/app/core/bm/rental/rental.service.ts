import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RentalModel } from './rental.model';
import {QueryResultsModel} from '../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryRentalModel } from './queryrental.model';
import { environment } from '../../../../environments/environment';

const API_FLOOR_URL = `${environment.baseAPI}/api/revenue`;
const API_CSV = `${environment.baseAPI}/api/excel/revenue/export`;




@Injectable({
	providedIn: 'root'
})
export class RentalService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListRental(queryParams: QueryRentalModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(API_FLOOR_URL + '/list?' + params,{ headers: httpHeaders });
	}

	
	findRentalById(_id: string): Observable<RentalModel>{
		return this.http.get<RentalModel>(`${API_FLOOR_URL}/${_id}`);
	}
	deleteRental(rentalId: string) {
		const url = `${API_FLOOR_URL}/delete/${rentalId}`;
		return this.http.delete(url);
	}
	updateRental(rental: RentalModel) {
		const url = `${API_FLOOR_URL}/edit/${rental._id}`;
		return this.http.patch(url, rental);
	}
	createRental(rental: RentalModel): Observable<RentalModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<RentalModel>(`${API_FLOOR_URL}/add`, rental, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	generateCode(): Observable<QueryResultsModel>{
		const url = `${API_FLOOR_URL}/generate/revenue`;
		return this.http.get<QueryResultsModel>(url);
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_CSV}`, "export-rental.xlsx");
	}
}
