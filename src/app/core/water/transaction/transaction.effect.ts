// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModelUpd } from '../../_base/crud-upd';
// Services
import { WaterTransactionService } from './transaction.service';
// State
import { AppState } from '../../../core/reducers';
import {
	WaterTransactionActionTypes,
	WaterTransactionPageRequested,
	WaterTransactionPageLoaded,
	WaterTransactionCreated,
	WaterTransactionDeleted,
	WaterTransactionUpdated,
	WaterTransactionOnServerCreated,
	WaterTransactionActionToggleLoading,
	WaterTransactionPageToggleLoading,
	WaterTransactionPageUnpost,
	WaterTransactionPageLoadedUnpost
} from './transaction.action';
import { QueryWaterTransactionModel } from './querytransaction.model';

@Injectable()
export class WaterTransactionEffect {
	showPageLoadingDistpatcher = new WaterTransactionPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new WaterTransactionPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new WaterTransactionActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new WaterTransactionActionToggleLoading({ isLoading: false });

	@Effect()
	loadWaterTransactionPage$ = this.actions$
		.pipe(
			ofType<WaterTransactionPageRequested>(WaterTransactionActionTypes.WaterTransactionPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.watertransaction.getListWaterTransaction(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; allTotalCount:any; totalCount: any; items: any };
				const result: QueryResultsModelUpd = {items: response[0].data,allTotalCount: response[0].allTotalCount, totalCount: response[0].totalCount, errorMessage: '', data: [],allBillingAmount:0 };
				const lastQuery: QueryWaterTransactionModel = response[1];
				return new WaterTransactionPageLoaded({
					watertransaction: result.items,
					allTotalCount: result.allTotalCount,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);
		
		@Effect()
		loadWaterTransactionPageUnpost$ = this.actions$
			.pipe(
				ofType<WaterTransactionPageUnpost>(WaterTransactionActionTypes.WaterTransactionPageUnpost),
				mergeMap(( { payload } ) => {
					this.store.dispatch(this.showPageLoadingDistpatcher);
					const requestToServer = this.watertransaction.getListWaterUnPost(payload.page);
					const lastQuery = of(payload.page);
					return forkJoin(requestToServer, lastQuery);
				}),
				map(response => {
					let res: { errorMessage: string; totalCount: any; items: any };
					const result: QueryResultsModelUpd = {items: response[0].data,allTotalCount: response[0].allTotalCount, totalCount: response[0].totalCount, errorMessage: '', data: [],allBillingAmount:0 };
					const lastQuery: QueryWaterTransactionModel = response[1];
					return new WaterTransactionPageLoadedUnpost({
						watertransaction: result.items,
						allTotalCount: result.allTotalCount,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}),
			);

	@Effect()
	deleteWaterTransaction$ = this.actions$
		.pipe(
			ofType<WaterTransactionDeleted>(WaterTransactionActionTypes.WaterTransactionDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.watertransaction.deleteWaterTransaction(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateWaterTransaction = this.actions$
		.pipe(
			ofType<WaterTransactionUpdated>(WaterTransactionActionTypes.WaterTransactionUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.watertransaction.updateWaterTransaction(payload.watertransaction);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<WaterTransactionOnServerCreated>(WaterTransactionActionTypes.WaterTransactionOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.watertransaction.createWaterTransaction(payload.watertransaction).pipe(
					tap(res => {
						this.store.dispatch(new WaterTransactionCreated({ watertransaction: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private watertransaction: WaterTransactionService, private store: Store<AppState>) { }
}
