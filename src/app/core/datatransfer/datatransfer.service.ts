import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';


const API_EXCEL_URL = 'http://172.18.25.30:3000/api/excel';

@Injectable({
	providedIn: 'root'
})
export class ExcelService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListProject(){
		return this.http.get(`${API_EXCEL_URL}/project/export`, {responseType: 'arraybuffer'});
	}
	getListBlock(){
		return this.http.get(`${API_EXCEL_URL}/block/export`, {responseType: 'arraybuffer'});
	}
	getListFloor(){
		return this.http.get(`${API_EXCEL_URL}/floor/export`, {responseType: 'arraybuffer'});
	}
	getListUnit(){
		return this.http.get(`${API_EXCEL_URL}/unit/export`, {responseType: 'arraybuffer'});
	}
	getListCustomer(){
		return this.http.get(`${API_EXCEL_URL}/customer/export`, {responseType: 'arraybuffer'});
	}

	/*createFloor(floor: FloorModel): Observable<FloorModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<FloorModel>(`${API_FLOOR_URL}/add`, floor, { headers: httpHeaders});
	}*/

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}
}
