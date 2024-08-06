import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { StockProductService } from './stockProduct.service';
import { AppState } from '../../../core/reducers';
import {
	StockProductActionTypes,
	StockProductPageRequested,
	StockProductPageLoaded,
	StockProductCreated,
	StockProductDeleted,
	StockProductUpdated,
	StockProductOnServerCreated,
	StockProductActionToggleLoading,
	StockProductPageToggleLoading
} from './stockProduct.action';
import { QueryStockProductModel } from './querystockProduct.model';


@Injectable()
export class StockProductEffect {
	showPageLoadingDistpatcher = new StockProductPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new StockProductPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new StockProductActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new StockProductActionToggleLoading({ isLoading: false });

	@Effect()
	loadStockProductPage$ = this.actions$
		.pipe(
			ofType<StockProductPageRequested>(StockProductActionTypes.StockProductPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.stockProduct.getListStockProduct(payload.page)
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
				const lastQuery: QueryStockProductModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new StockProductPageLoaded({
					stockProduct: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new StockProductPageLoaded({
						stockProduct: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteStockProduct$ = this.actions$
		.pipe(
			ofType<StockProductDeleted>(StockProductActionTypes.StockProductDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.stockProduct.deleteStockProduct(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateStockProduct = this.actions$
		.pipe(
			ofType<StockProductUpdated>(StockProductActionTypes.StockProductUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.stockProduct.updateStockProduct(payload.stockProduct);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<StockProductOnServerCreated>(StockProductActionTypes.StockProductOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.stockProduct.createStockProduct(payload.stockProduct).pipe(
					tap(res => {
						this.store.dispatch(new StockProductCreated({ stockProduct: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private stockProduct: StockProductService, private store: Store<AppState>) { }
}
