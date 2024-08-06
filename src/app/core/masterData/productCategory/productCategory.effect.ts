
import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { ProductCategoryService } from './productCategory.service';
import { AppState } from '../../../core/reducers';
import {
	ProductCategoryActionTypes,
	ProductCategoryPageRequested,
	ProductCategoryPageLoaded,
	ProductCategoryCreated,
	ProductCategoryDeleted,
	ProductCategoryUpdated,
	ProductCategoryOnServerCreated,
	ProductCategoryActionToggleLoading,
	ProductCategoryPageToggleLoading
} from './productCategory.action';
import { QueryProductCategoryModel } from './queryproductCategory.model';


@Injectable()
export class ProductCategoryEffect {
	showPageLoadingDistpatcher = new ProductCategoryPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ProductCategoryPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ProductCategoryActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ProductCategoryActionToggleLoading({ isLoading: false });

	@Effect()
	loadProductCategoryPage$ = this.actions$
		.pipe(
			ofType<ProductCategoryPageRequested>(ProductCategoryActionTypes.ProductCategoryPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.productCategory.getListProductCategory(payload.page)
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
				const lastQuery: QueryProductCategoryModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new ProductCategoryPageLoaded({
					productCategory: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new ProductCategoryPageLoaded({
						productCategory: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteProductCategory$ = this.actions$
		.pipe(
			ofType<ProductCategoryDeleted>(ProductCategoryActionTypes.ProductCategoryDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.productCategory.deleteProductCategory(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateProductCategory = this.actions$
		.pipe(
			ofType<ProductCategoryUpdated>(ProductCategoryActionTypes.ProductCategoryUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.productCategory.updateProductCategory(payload.productCategory);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<ProductCategoryOnServerCreated>(ProductCategoryActionTypes.ProductCategoryOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.productCategory.createProductCategory(payload.productCategory).pipe(
					tap(res => {
						this.store.dispatch(new ProductCategoryCreated({ productCategory: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private productCategory: ProductCategoryService, private store: Store<AppState>) { }
}
