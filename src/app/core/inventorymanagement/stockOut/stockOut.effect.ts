import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { StockOutService } from './stockOut.service';
import { AppState } from '../../../core/reducers';
import {
	StockOutActionTypes,
	StockOutPageRequested,
	StockOutPageLoaded,
	StockOutCreated,
	StockOutDeleted,
	StockOutUpdated,
	StockOutOnServerCreated,
	StockOutActionToggleLoading,
	StockOutPageToggleLoading
} from './stockOut.action';
import { QueryStockOutModel } from './querystockOut.model';


@Injectable()
export class StockOutEffect {
	showPageLoadingDistpatcher = new StockOutPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new StockOutPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new StockOutActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new StockOutActionToggleLoading({ isLoading: false });

	@Effect()
	loadStockOutPage$ = this.actions$
		.pipe(
			ofType<StockOutPageRequested>(StockOutActionTypes.StockOutPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.stockOut.getListStockOut(payload.page)
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
				const lastQuery: QueryStockOutModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				//console.log(response[0].data);
				return new StockOutPageLoaded({
					stockOut: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new StockOutPageLoaded({
						stockOut: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteStockOut$ = this.actions$
		.pipe(
			ofType<StockOutDeleted>(StockOutActionTypes.StockOutDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.stockOut.deleteStockOut(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateStockOut = this.actions$
		.pipe(
			ofType<StockOutUpdated>(StockOutActionTypes.StockOutUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.stockOut.updateStockOut(payload.stockOut);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<StockOutOnServerCreated>(StockOutActionTypes.StockOutOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.stockOut.createStockOut(payload.stockOut).pipe(
					tap(res => {
						this.store.dispatch(new StockOutCreated({ stockOut: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private stockOut: StockOutService, private store: Store<AppState>) { }
}
