import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { StockInService } from './stockIn.service';
import { AppState } from '../../../core/reducers';
import {
	StockInActionTypes,
	StockInPageRequested,
	StockInPageLoaded,
	StockInCreated,
	StockInDeleted,
	StockInUpdated,
	StockInOnServerCreated,
	StockInActionToggleLoading,
	StockInPageToggleLoading
} from './stockIn.action';
import { QueryStockInModel } from './querystockIn.model';


@Injectable()
export class StockInEffect {
	showPageLoadingDistpatcher = new StockInPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new StockInPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new StockInActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new StockInActionToggleLoading({ isLoading: false });

	@Effect()
	loadStockInPage$ = this.actions$
		.pipe(
			ofType<StockInPageRequested>(StockInActionTypes.StockInPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.stockIn.getListStockIn(payload.page)
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
				const lastQuery: QueryStockInModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new StockInPageLoaded({
					stockIn: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new StockInPageLoaded({
						stockIn: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteStockIn$ = this.actions$
		.pipe(
			ofType<StockInDeleted>(StockInActionTypes.StockInDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.stockIn.deleteStockIn(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateStockIn = this.actions$
		.pipe(
			ofType<StockInUpdated>(StockInActionTypes.StockInUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.stockIn.updateStockIn(payload.stockIn);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<StockInOnServerCreated>(StockInActionTypes.StockInOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.stockIn.createStockIn(payload.stockIn).pipe(
					tap(res => {
						this.store.dispatch(new StockInCreated({ stockIn: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private stockIn: StockInService, private store: Store<AppState>) { }
}
