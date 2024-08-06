import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { WaterMeterModel } from "./meter.model";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { QueryResultsModel } from "../../_base/crud";
import { QueryWaterMeterModel } from "./querymeter.model";

import * as FileSaver from 'file-saver';
const API_EXCEL = `${environment.baseAPI}/api/excel/watermas/export`;

const API_WATER_RATE_URL = `${environment.baseAPI}/api/water/master`;

const API_WATER_RATE_URL_NEW = `${environment.baseAPI}/api/water/transaksi`;
const API_WATER_RATE_URL_MASTER = `${environment.baseAPI}/api/water/master`;




@Injectable({
	providedIn: "root",
})
export class WaterMeterService {
	constructor(private http: HttpClient) { }
	// get list block group

	getListWaterMeter(
		queryParams: QueryWaterMeterModel
	): Observable<QueryResultsModel> {
		// return this.http.get<QueryResultsModel>(`${API_WATER_RATE_URL}`);
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		// let params = new HttpParams({
		// 	fromObject: queryParams
		// });
		// @ts-ignore
		let options = {
			param: JSON.stringify(queryParams),
		};
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key]);
		}
		return this.http.get<QueryResultsModel>(
			API_WATER_RATE_URL + "/list?" + params,
			{ headers: httpHeaders }
		);
	}

	/**
	 * This (old)
	 */
	// getListWaterMeterforTr(
	// 	queryParams
	// ): Observable<QueryResultsModel> {
	// 	const httpHeaders = new HttpHeaders();
	// 	httpHeaders.set("Content-Type", "application/json");
	// 	let options = {
	// 		param: JSON.stringify(queryParams),
	// 	};
	// 	let params = new URLSearchParams();
	// 	for (let key in options) {
	// 		params.set(key, options[key]);
	// 	}
	// 	return this.http.get<QueryResultsModel>(
	// 		API_WATER_RATE_URL + "/listforTr?" + params,
	// 		{ headers: httpHeaders }
	// 	);
	// }

	// /**
	//  * This Layouting (new)
	//  * @param queryParams 
	//  * @returns 
	//  */
	getListWaterMeterforTr(
		queryParams
	): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		let options = {
			params: JSON.stringify(queryParams),
		};
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key]);
		}
		return this.http.get<QueryResultsModel>(
			API_WATER_RATE_URL_NEW + "/get/masterwater/byquery?" + params,
			{ headers: httpHeaders }
		);
	}


	/**
	 * This old API (old)
	 */
	// getWaterMeter(id) {
	// 	return this.http.get<any>(`${API_WATER_RATE_URL}/${id}`);
	// }

	// /**
	//  * This new layouting API (new)
	//  * @param id 
	//  * @returns 
	//  */
	getWaterMeter(id) {
		return this.http.get<any>(`${API_WATER_RATE_URL_NEW}/${id}`);
	}

	getWaterMeterMaster(id) {
		return this.http.get<any>(`${API_WATER_RATE_URL_MASTER}/${id}`);
	}


	deleteWaterMeter(waterMeterId: string) {
		const url = `${API_WATER_RATE_URL}/delete/${waterMeterId}`;
		return this.http.delete(url);
	}
	updateWaterMeter(waterMeter: WaterMeterModel) {
		const url = `${API_WATER_RATE_URL}/edit/${waterMeter._id}`;
		return this.http.patch(url, waterMeter);
	}
	createWaterMeter(waterMeter: WaterMeterModel): Observable<WaterMeterModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http.post<WaterMeterModel>(
			`${API_WATER_RATE_URL}/add`,
			waterMeter,
			{ headers: httpHeaders }
		);
	}
	exportExcel() {
		return FileSaver.saveAs(`${API_EXCEL}`, "export-watermeter.xlsx");
	}


	// Get Last Consumption master Water 
	getLastConsumptionWater(queryParams) {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			params: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<any>(API_WATER_RATE_URL_NEW + '/get/lastconsumption/byquery?' + params, { headers: httpHeaders });
	}



	private handleError<T>(operation = "operation", result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};




	}
}
