// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { Observable, defer, of, forkJoin, throwError } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../_base/crud';
// Services
import { AccountHistoryService } from './accountHistory.service';
// State
import { AppState } from '../reducers';
import {
	AccountHistoryActionTypes,
	AccountHistoryPageRequested,
	AccountHistoryPageLoaded,
	AccountHistoryCreated,
	AccountHistoryDeleted,
	AccountHistoryUpdated,
	AccountHistoryOnServerCreated,
	AccountHistoryActionToggleLoading,
	AccountHistoryPageToggleLoading
} from './accountHistory.action';
import { QueryAccountHistoryModel } from './queryaccountHistory.model';


@Injectable()
export class AccountHistoryEffect {
	showPageLoadingDistpatcher = new AccountHistoryPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new AccountHistoryPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new AccountHistoryActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new AccountHistoryActionToggleLoading({ isLoading: false });

	@Effect()
	loadAccountHistoryPage$ = this.actions$
		.pipe(
			ofType<AccountHistoryPageRequested>(AccountHistoryActionTypes.AccountHistoryPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.accountHistory.getListAccountHistory(payload.page)
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
				const lastQuery: QueryAccountHistoryModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new AccountHistoryPageLoaded({
					accountHistory: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new AccountHistoryPageLoaded({
						accountHistory: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteAccountHistory$ = this.actions$
		.pipe(
			ofType<AccountHistoryDeleted>(AccountHistoryActionTypes.AccountHistoryDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.accountHistory.deleteAccountHistory(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateAccountHistory = this.actions$
		.pipe(
			ofType<AccountHistoryUpdated>(AccountHistoryActionTypes.AccountHistoryUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.accountHistory.updateAccountHistory(payload.accountHistory);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<AccountHistoryOnServerCreated>(AccountHistoryActionTypes.AccountHistoryOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.accountHistory.createAccountHistory(payload.accountHistory).pipe(
					tap(res => {
						this.store.dispatch(new AccountHistoryCreated({ accountHistory: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private accountHistory: AccountHistoryService, private store: Store<AppState>) { }
}
