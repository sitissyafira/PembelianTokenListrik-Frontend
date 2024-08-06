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
import { TransactionsService } from './transactions.service';
// State
import { AppState } from '../reducers';
import {
	TransactionsActionTypes,
	TransactionsPageRequested,
	TransactionsPageLoaded,
	TransactionsCreated,
	TransactionsDeleted,
	TransactionsUpdated,
	TransactionsOnServerCreated,
	TransactionsActionToggleLoading,
	TransactionsPageToggleLoading
} from './transactions.action';
import { QueryTransactionsModel } from './querytransactions.model';


@Injectable()
export class TransactionsEffect {
	showPageLoadingDistpatcher = new TransactionsPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new TransactionsPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new TransactionsActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new TransactionsActionToggleLoading({ isLoading: false });

	@Effect()
	loadTransactionsPage$ = this.actions$
		.pipe(
			ofType<TransactionsPageRequested>(TransactionsActionTypes.TransactionsPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.transactions.getListTransactions(payload.page)
					.pipe(
						catchError(err => {
							return throwError(err);
						}),
						catchError(err => {
							return of(err)
						})
					);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map((response: any) => {
				const lastQuery: QueryTransactionsModel = response[1];
				if (response[0].status && response[0].status === "success") {
					const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
					return new TransactionsPageLoaded({
						transactions: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				} else {
					const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new TransactionsPageLoaded({
						transactions: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteTransactions$ = this.actions$
		.pipe(
			ofType<TransactionsDeleted>(TransactionsActionTypes.TransactionsDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.transactions.deleteTransactions(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateTransactions = this.actions$
		.pipe(
			ofType<TransactionsUpdated>(TransactionsActionTypes.TransactionsUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.transactions.updateTransactions(payload.transactions);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<TransactionsOnServerCreated>(TransactionsActionTypes.TransactionsOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.transactions.createTransactions(payload.transactions).pipe(
					tap(res => {
						this.store.dispatch(new TransactionsCreated({ transactions: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private transactions: TransactionsService, private store: Store<AppState>) { }
}
