
import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { ProductBrandService } from './productBrand.service';
import { AppState } from '../../../core/reducers';
import {
	ProductBrandActionTypes,
	ProductBrandPageRequested,
	ProductBrandPageLoaded,
	ProductBrandCreated,
	ProductBrandDeleted,
	ProductBrandUpdated,
	ProductBrandOnServerCreated,
	ProductBrandActionToggleLoading,
	ProductBrandPageToggleLoading
} from './productBrand.action';
import { QueryProductBrandModel } from './queryproductBrand.model';


@Injectable()
export class ProductBrandEffect {
	showPageLoadingDistpatcher = new ProductBrandPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ProductBrandPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ProductBrandActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ProductBrandActionToggleLoading({ isLoading: false });

	@Effect()
	loadProductBrandPage$ = this.actions$
		.pipe(
			ofType<ProductBrandPageRequested>(ProductBrandActionTypes.ProductBrandPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.productBrand.getListProductBrand(payload.page)
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
				const lastQuery: QueryProductBrandModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new ProductBrandPageLoaded({
					productBrand: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new ProductBrandPageLoaded({
						productBrand: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteProductBrand$ = this.actions$
		.pipe(
			ofType<ProductBrandDeleted>(ProductBrandActionTypes.ProductBrandDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.productBrand.deleteProductBrand(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateProductBrand = this.actions$
		.pipe(
			ofType<ProductBrandUpdated>(ProductBrandActionTypes.ProductBrandUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.productBrand.updateProductBrand(payload.productBrand);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<ProductBrandOnServerCreated>(ProductBrandActionTypes.ProductBrandOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.productBrand.createProductBrand(payload.productBrand).pipe(
					tap(res => {
						this.store.dispatch(new ProductBrandCreated({ productBrand: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private productBrand: ProductBrandService, private store: Store<AppState>) { }
}
