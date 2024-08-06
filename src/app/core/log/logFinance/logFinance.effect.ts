import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { LogFinanceService } from './logFinance.service';
import { AppState } from '../../../core/reducers';
import {
	LogFinanceActionTypes,
	LogFinancePageRequested,
	LogFinancePageLoaded,
	LogFinanceUpdated,
	LogFinanceActionToggleLoading,
	LogFinancePageToggleLoading,
	LogFinancePageRequestedAP,
	LogFinancePageRequestedPR,
	LogFinancePageRequestedPO,
	LogFinancePageRequestedQU,
	LogFinancePageRequestedPD,
	LogFinancePageRequestedSI
} from './logFinance.action';
import { QueryLogFinanceModel } from './querylogFinance.model';

@Injectable()
export class LogFinanceEffect {
	showPageLoadingDistpatcher = new LogFinancePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new LogFinancePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new LogFinanceActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new LogFinanceActionToggleLoading({ isLoading: false });

	@Effect()
	loadLogFinancePage$ = this.actions$
		.pipe(
			ofType<LogFinancePageRequested>(LogFinanceActionTypes.LogFinancePageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.logFinance.getListLogFinanceAR(payload.page)
				.pipe(
					catchError (err =>{
						return throwError(err);
					}),
					catchError(err => {
						return of (err)
					})
				);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map((response : any ) => {
				const lastQuery: QueryLogFinanceModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new LogFinancePageLoaded({
					logFinance: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new LogFinancePageLoaded({
						logFinance: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);
	

	@Effect()
		loadLogFinancePageAP$ = this.actions$
			.pipe(
				ofType<LogFinancePageRequestedAP>(LogFinanceActionTypes.LogFinancePageRequestedAP),
				mergeMap(( { payload } ) => {
					this.store.dispatch(this.showPageLoadingDistpatcher);
					const requestToServer = this.logFinance.getListLogFinanceAP(payload.page)
					.pipe(
						catchError (err =>{
							return throwError(err);
						}),
						catchError(err => {
							return of (err)
						})
					);
					const lastQuery = of(payload.page);
					return forkJoin(requestToServer, lastQuery);
				}),
				map((response : any ) => {
					const lastQuery: QueryLogFinanceModel = response[1];
					if(response[0].status && response[0].status === "success"){
					const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
					return new LogFinancePageLoaded({
						logFinance: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}else {
					const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
						return new LogFinancePageLoaded({
							logFinance: result.items,
							totalCount: result.totalCount,
							page: lastQuery
						});
					}
				}),
			);

	
		@Effect()
		loadLogFinancePagePR$ = this.actions$
				.pipe(
					ofType<LogFinancePageRequestedPR>(LogFinanceActionTypes.LogFinancePageRequestedPR),
					mergeMap(( { payload } ) => {
						this.store.dispatch(this.showPageLoadingDistpatcher);
						const requestToServer = this.logFinance.getListLogFinancePR(payload.page)
						.pipe(
							catchError (err =>{
								return throwError(err);
							}),
							catchError(err => {
								return of (err)
							})
						);
						const lastQuery = of(payload.page);
						return forkJoin(requestToServer, lastQuery);
					}),
					map((response : any ) => {
						const lastQuery: QueryLogFinanceModel = response[1];
						if(response[0].status && response[0].status === "success"){
						const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
						return new LogFinancePageLoaded({
							logFinance: result.items,
							totalCount: result.totalCount,
							page: lastQuery
						});
					}else {
						const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
							return new LogFinancePageLoaded({
								logFinance: result.items,
								totalCount: result.totalCount,
								page: lastQuery
							});
						}
					}),
				);

				@Effect()
				loadLogFinancePagePO$ = this.actions$
						.pipe(
							ofType<LogFinancePageRequestedPO>(LogFinanceActionTypes.LogFinancePageRequestedPO),
							mergeMap(( { payload } ) => {
								this.store.dispatch(this.showPageLoadingDistpatcher);
								const requestToServer = this.logFinance.getListLogFinancePO(payload.page)
								.pipe(
									catchError (err =>{
										return throwError(err);
									}),
									catchError(err => {
										return of (err)
									})
								);
								const lastQuery = of(payload.page);
								return forkJoin(requestToServer, lastQuery);
							}),
							map((response : any ) => {
								const lastQuery: QueryLogFinanceModel = response[1];
								if(response[0].status && response[0].status === "success"){
								const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
								return new LogFinancePageLoaded({
									logFinance: result.items,
									totalCount: result.totalCount,
									page: lastQuery
								});
							}else {
								const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
									return new LogFinancePageLoaded({
										logFinance: result.items,
										totalCount: result.totalCount,
										page: lastQuery
									});
								}
							}),
						);
	

						@Effect()
						loadLogFinancePageQU$ = this.actions$
								.pipe(
									ofType<LogFinancePageRequestedQU>(LogFinanceActionTypes.LogFinancePageRequestedQU),
									mergeMap(( { payload } ) => {
										this.store.dispatch(this.showPageLoadingDistpatcher);
										const requestToServer = this.logFinance.getListLogFinanceQU(payload.page)
										.pipe(
											catchError (err =>{
												return throwError(err);
											}),
											catchError(err => {
												return of (err)
											})
										);
										const lastQuery = of(payload.page);
										return forkJoin(requestToServer, lastQuery);
									}),
									map((response : any ) => {
										const lastQuery: QueryLogFinanceModel = response[1];
										if(response[0].status && response[0].status === "success"){
										const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
										return new LogFinancePageLoaded({
											logFinance: result.items,
											totalCount: result.totalCount,
											page: lastQuery
										});
									}else {
										const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
											return new LogFinancePageLoaded({
												logFinance: result.items,
												totalCount: result.totalCount,
												page: lastQuery
											});
										}
									}),
								)
		@Effect()
		loadLogFinancePagePD$ = this.actions$
				.pipe(
					ofType<LogFinancePageRequestedPD>(LogFinanceActionTypes.LogFinancePageRequestedPD),
					mergeMap(( { payload } ) => {
						this.store.dispatch(this.showPageLoadingDistpatcher);
						const requestToServer = this.logFinance.getListLogFinancePD(payload.page)
						.pipe(
							catchError (err =>{
								return throwError(err);
							}),
							catchError(err => {
								return of (err)
							})
						);
						const lastQuery = of(payload.page);
						return forkJoin(requestToServer, lastQuery);
					}),
					map((response : any ) => {
						const lastQuery: QueryLogFinanceModel = response[1];
						if(response[0].status && response[0].status === "success"){
						const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
						return new LogFinancePageLoaded({
							logFinance: result.items,
							totalCount: result.totalCount,
							page: lastQuery
						});
					}else {
						const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
							return new LogFinancePageLoaded({
								logFinance: result.items,
								totalCount: result.totalCount,
								page: lastQuery
							});
						}
					}),
				);

@Effect()
loadLogFinancePageSI$ = this.actions$
	.pipe(
		ofType<LogFinancePageRequestedSI>(LogFinanceActionTypes.LogFinancePageRequestedSI),
		mergeMap(( { payload } ) => {
			this.store.dispatch(this.showPageLoadingDistpatcher);
			const requestToServer = this.logFinance.getListLogFinancePD(payload.page)
			.pipe(
				catchError (err =>{
					return throwError(err);
				}),
				catchError(err => {
					return of (err)
				})
			);
			const lastQuery = of(payload.page);
			return forkJoin(requestToServer, lastQuery);
		}),
		map((response : any ) => {
			const lastQuery: QueryLogFinanceModel = response[1];
			if(response[0].status && response[0].status === "success"){
			const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
			return new LogFinancePageLoaded({
				logFinance: result.items,
				totalCount: result.totalCount,
				page: lastQuery
			});
		}else {
			const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
				return new LogFinancePageLoaded({
					logFinance: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}
		}),
	);

	@Effect()
	updateLogFinance = this.actions$
		.pipe(
			ofType<LogFinanceUpdated>(LogFinanceActionTypes.LogFinanceUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.logFinance.updateLogFinance(payload.logFinance);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	
	constructor(private actions$: Actions, private logFinance: LogFinanceService, private store: Store<AppState>) { }
}
