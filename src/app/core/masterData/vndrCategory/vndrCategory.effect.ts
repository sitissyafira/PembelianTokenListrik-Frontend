import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { VndrCategoryService } from './vndrCategory.service';
import { AppState } from '../../../core/reducers';
import {
	VndrCategoryActionTypes,
	VndrCategoryPageRequested,
	VndrCategoryPageLoaded,
	VndrCategoryCreated,
	VndrCategoryDeleted,
	VndrCategoryUpdated,
	VndrCategoryOnServerCreated,
	VndrCategoryActionToggleLoading,
	VndrCategoryPageToggleLoading
} from './vndrCategory.action';
import { QueryVndrCategoryModel } from './queryvndrCategory.model';


@Injectable()
export class VndrCategoryEffect {
	showPageLoadingDistpatcher = new VndrCategoryPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new VndrCategoryPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new VndrCategoryActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new VndrCategoryActionToggleLoading({ isLoading: false });

	@Effect()
	loadVndrCategoryPage$ = this.actions$
		.pipe(
			ofType<VndrCategoryPageRequested>(VndrCategoryActionTypes.VndrCategoryPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.vndrCategory.getListVndrCategory(payload.page)
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
				const lastQuery: QueryVndrCategoryModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new VndrCategoryPageLoaded({
					vndrCategory: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new VndrCategoryPageLoaded({
						vndrCategory: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteVndrCategory$ = this.actions$
		.pipe(
			ofType<VndrCategoryDeleted>(VndrCategoryActionTypes.VndrCategoryDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.vndrCategory.deleteVndrCategory(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateVndrCategory = this.actions$
		.pipe(
			ofType<VndrCategoryUpdated>(VndrCategoryActionTypes.VndrCategoryUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.vndrCategory.updateVndrCategory(payload.vndrCategory);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<VndrCategoryOnServerCreated>(VndrCategoryActionTypes.VndrCategoryOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.vndrCategory.createVndrCategory(payload.vndrCategory).pipe(
					tap(res => {
						this.store.dispatch(new VndrCategoryCreated({ vndrCategory: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private vndrCategory: VndrCategoryService, private store: Store<AppState>) { }
}
