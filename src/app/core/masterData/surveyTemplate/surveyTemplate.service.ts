import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SurveyTemplateModel } from './surveyTemplate.model';
import { environment } from '../../../../environments/environment';
import { QueryResultsModel} from '../../_base/crud';
import * as FileSaver from 'file-saver';
import { QuerySurveyTemplateModel } from './querysurveyTemplate.model';

const API_BASE = `${environment.baseAPI}/api/surveyTemplate`;

@Injectable({
	providedIn: 'root'
})
export class SurveyTemplateService {
	constructor(private http: HttpClient) {}
	getListSurveyTemplate(queryParams: QuerySurveyTemplateModel): Observable<QueryResultsModel>{
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
	
	findSurveyTemplateById(_id: string): Observable<SurveyTemplateModel>{
		return this.http.get<SurveyTemplateModel>(`${API_BASE}/${_id}`);
	}
	deleteSurveyTemplate(surveyTemplateId: string) {
		const url = `${API_BASE}/delete/${surveyTemplateId}`;
		return this.http.delete(url);
	}

	deleteFlagSurveyTemplate(visitor: SurveyTemplateModel) {
		const url = `${API_BASE}/deleteflag/${visitor._id}`;
		return this.http.patch(url, visitor);
	}

	updateSurveyTemplate(surveyTemplate: SurveyTemplateModel) {
		const url = `${API_BASE}/edit/${surveyTemplate._id}`;
		return this.http.patch(url, surveyTemplate);
	}
	
	createSurveyTemplate(surveyTemplate: SurveyTemplateModel): Observable<SurveyTemplateModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<SurveyTemplateModel>(`${API_BASE}/add`, surveyTemplate, { headers: httpHeaders});
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			console.error(error);
			return of(result);
		};
	}
	
	exportExcel(){
		return FileSaver.saveAs(`${API_BASE}/excel/export`, "export-surveyTemplate.xlsx");
	}
}
