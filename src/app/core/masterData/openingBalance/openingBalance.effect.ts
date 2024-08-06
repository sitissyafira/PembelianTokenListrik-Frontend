// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { Observable, defer, of, forkJoin, throwError } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { OpeningBalanceService } from './openingBalance.service';
// State
import { AppState } from '../../../core/reducers';
import {
	OpeningBalanceActionTypes,
	OpeningBalancePageRequested,
	OpeningBalancePageLoaded,
	OpeningBalanceCreated,
	OpeningBalanceDeleted,
	OpeningBalanceUpdated,
	OpeningBalanceOnServerCreated,
	OpeningBalanceActionToggleLoading,
	OpeningBalancePageToggleLoading
} from './openingBalance.action';
import { QueryOpeningBalanceModel } from './queryaopeningBalance.model';



@Injectable()
export class OpeningBalanceEffect {
	showPageLoadingDistpatcher = new OpeningBalancePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new OpeningBalancePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new OpeningBalanceActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new OpeningBalanceActionToggleLoading({ isLoading: false });

	@Effect()
	loadOpeningBalancePage$ = this.actions$
		.pipe(
			ofType<OpeningBalancePageRequested>(OpeningBalanceActionTypes.OpeningBalancePageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.openingBalance.getListOpeningBalance(payload.page)
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
				const lastQuery: QueryOpeningBalanceModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new OpeningBalancePageLoaded({
					openingBalance: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new OpeningBalancePageLoaded({
						openingBalance: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteOpeningBalance$ = this.actions$
		.pipe(
			ofType<OpeningBalanceDeleted>(OpeningBalanceActionTypes.OpeningBalanceDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.openingBalance.deleteOpeningBalance(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateOpeningBalance = this.actions$
		.pipe(
			ofType<OpeningBalanceUpdated>(OpeningBalanceActionTypes.OpeningBalanceUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.openingBalance.updateOpeningBalance(payload.openingBalance);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<OpeningBalanceOnServerCreated>(OpeningBalanceActionTypes.OpeningBalanceOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.openingBalance.createOpeningBalance(payload.openingBalance).pipe(
					tap(res => {
						this.store.dispatch(new OpeningBalanceCreated({ openingBalance: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private openingBalance: OpeningBalanceService, private store: Store<AppState>) { }
}
