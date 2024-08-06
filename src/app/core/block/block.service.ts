import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BlockModel} from './block.model';
import {QueryResultsModel} from '../_base/crud';
import {QueryBlockModel} from './queryblock.model';
import * as FileSaver from 'file-saver';
import { environment } from '../../../environments/environment';

const API_BLOCK_URL = `${environment.baseAPI}/api/block`;
const API_EXCEL = `${environment.baseAPI}/api/excel/block/export`;



@Injectable({
	providedIn: 'root'
})
export class BlockService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListBlock(queryParams: QueryBlockModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_BLOCK_URL + '/list?' + params,{ headers: httpHeaders });
	}
	deleteBlock(blockId: string) {
		const url = `${API_BLOCK_URL}/delete/${blockId}`;
		return this.http.delete(url);
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_EXCEL}`, "export-block.xlsx");
	}
	
	updateBlock(block: BlockModel) {
		const url = `${API_BLOCK_URL}/edit/${block._id}`;
		return this.http.patch(url, block);
	}
	createBlock(block: BlockModel): Observable<BlockModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<BlockModel>(`${API_BLOCK_URL}/add`, block, { headers: httpHeaders});
	}
	findBlockByParent(id: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_BLOCK_URL}/parent/${id}`);
	}
	findBlockById(id: any): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_BLOCK_URL}/${id}`);
	}

	getBlockId(id){
		return this.http.get<any>(`${API_BLOCK_URL}/${id}`);
	}
	findBlockByIdPlain(id: any): Observable<any>{
		return this.http.get<any>(`${API_BLOCK_URL}/${id}`);
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
