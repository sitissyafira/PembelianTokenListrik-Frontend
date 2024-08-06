import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BlockgroupModel} from './blockgroup.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {QueryParamsModel, QueryResultsModel} from '../_base/crud';
import * as FileSaver from 'file-saver';
import {HttpParams} from '@angular/common/http';

const API_BLOCK_GROUP_URL = `${environment.baseAPI}/api/blockgroup`;
const API_EXCEL = `${environment.baseAPI}/api/excel/project/export`;




@Injectable({
	providedIn: 'root'
})
export class BlockGroupService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListBlockGroup(queryParams: QueryParamsModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_BLOCK_GROUP_URL}`);
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
		return this.http.get<QueryResultsModel>(API_BLOCK_GROUP_URL + '/list?' + params,{ headers: httpHeaders });
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_EXCEL}`, "export-project.xlsx");
	}

	getBlockGroupById(id: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_BLOCK_GROUP_URL}/${id}`);
	}

	getBlockGroupByIdBlock(id: string): Observable<any>{
		return this.http.get<any>(`${API_BLOCK_GROUP_URL}/${id}`);
	}
	deleteBlockGroup(blockGroupId: string) {
		const url = `${API_BLOCK_GROUP_URL}/delete/${blockGroupId}`;
		return this.http.delete(url);
	}
	updateBlockGroup(blockGroup: BlockgroupModel) {
		const url = `${API_BLOCK_GROUP_URL}/edit/${blockGroup._id}`;
		return this.http.patch(url, blockGroup);
	}
	createBlockGroup(blockGroup: BlockgroupModel): Observable<BlockgroupModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<BlockgroupModel>(`${API_BLOCK_GROUP_URL}/add`, blockGroup, { headers: httpHeaders});
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
