// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { GasTransactionService } from './transaction.service';
// State
import { AppState } from '../../../core/reducers';
import {
	GasTransactionActionTypes,
	GasTransactionPageRequested,
	GasTransactionPageLoaded,
	GasTransactionCreated,
	GasTransactionDeleted,
	GasTransactionUpdated,
	GasTransactionOnServerCreated,
	GasTransactionActionToggleLoading,
	GasTransactionPageToggleLoading,
	GasTransactionPageUnpost,
	GasTransactionPageLoadedUnpost
} from './transaction.action';
import { QueryGasTransactionModel } from './querytransaction.model';

@Injectable()
export class GasTransactionEffect {
	showPageLoadingDistpatcher = new GasTransactionPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new GasTransactionPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new GasTransactionActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new GasTransactionActionToggleLoading({ isLoading: false });

	@Effect()
	loadGasTransactionPage$ = this.actions$
		.pipe(
			ofType<GasTransactionPageRequested>(GasTransactionActionTypes.GasTransactionPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.gastransaction.getListGasTransaction(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: '', data: [] };
				const lastQuery: QueryGasTransactionModel = response[1];
				return new GasTransactionPageLoaded({
					gastransaction: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);
		
		@Effect()
		loadGasTransactionPageUnpost$ = this.actions$
			.pipe(
				ofType<GasTransactionPageUnpost>(GasTransactionActionTypes.GasTransactionPageUnpost),
				mergeMap(( { payload } ) => {
					this.store.dispatch(this.showPageLoadingDistpatcher);
					const requestToServer = this.gastransaction.getListGasUnPost(payload.page);
					const lastQuery = of(payload.page);
					return forkJoin(requestToServer, lastQuery);
				}),
				map(response => {
					let res: { errorMessage: string; totalCount: any; items: any };
					const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: '', data: [] };
					const lastQuery: QueryGasTransactionModel = response[1];
					return new GasTransactionPageLoadedUnpost({
						gastransaction: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}),
			);

	@Effect()
	deleteGasTransaction$ = this.actions$
		.pipe(
			ofType<GasTransactionDeleted>(GasTransactionActionTypes.GasTransactionDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.gastransaction.deleteGasTransaction(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateGasTransaction = this.actions$
		.pipe(
			ofType<GasTransactionUpdated>(GasTransactionActionTypes.GasTransactionUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.gastransaction.updateGasTransaction(payload.gastransaction);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<GasTransactionOnServerCreated>(GasTransactionActionTypes.GasTransactionOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.gastransaction.createGasTransaction(payload.gastransaction).pipe(
					tap(res => {
						this.store.dispatch(new GasTransactionCreated({ gastransaction: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private gastransaction: GasTransactionService, private store: Store<AppState>) { }
}
