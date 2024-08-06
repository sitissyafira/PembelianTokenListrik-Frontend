import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CheckpointModel } from './checkpoint.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QueryCheckpointModel } from './querycheckpoint.model';

const API_BASE = `${environment.baseAPI}/api/checkpoint`;

@Injectable({
	providedIn: 'root'
})
export class CheckpointService {
	constructor(private http: HttpClient) {}
	getListCheckpoint(queryParams: QueryCheckpointModel): Observable<QueryResultsModel>{
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
	
	findCheckpointById(_id: string): Observable<CheckpointModel>{
		return this.http.get<CheckpointModel>(`${API_BASE}/${_id}`);
	}
	deleteCheckpoint(checkpointId: string) {
		const url = `${API_BASE}/delete/${checkpointId}`;
		return this.http.delete(url);
	}

	deleteFlagCheckpoint(visitor: CheckpointModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateCheckpoint(checkpoint: CheckpointModel) {
		const url = `${API_BASE}/edit/${checkpoint._id}`;
		return this.http.patch(url, checkpoint);
	}
	
	createCheckpoint(checkpoint: CheckpointModel): Observable<CheckpointModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<CheckpointModel>(`${API_BASE}/add`, checkpoint, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-checkpoint.xlsx");
	}
}
