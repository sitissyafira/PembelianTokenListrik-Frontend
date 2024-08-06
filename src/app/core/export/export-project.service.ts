import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import { environment } from '../../../environments/environment';
const API_BLOCK_URL = `${environment.baseAPI}/api/block`;

@Injectable({
  providedIn: 'root'
})
export class ExportProjectService {

  constructor(private http: HttpClient) { }
	getExcel(request, fileName)
	{
	}
}
