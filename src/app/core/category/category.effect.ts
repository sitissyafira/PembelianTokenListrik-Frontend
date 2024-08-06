// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../_base/crud';
// Services
import { CategoryService } from './category.service';
// State
import { AppState } from '../../core/reducers';
import {
	CategoryActionTypes,
	CategoryPageRequested,
	CategoryPageLoaded,
	CategoryCreated,
	CategoryDeleted,
	CategoryUpdated,
	CategoryOnServerCreated,
	CategoryActionToggleLoading,
	CategoryPageToggleLoading
} from './category.action';
import { QueryCategoryModel } from './querycategory.model';


@Injectable()
export class CategoryEffect {
	showPageLoadingDistpatcher = new CategoryPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new CategoryPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new CategoryActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new CategoryActionToggleLoading({ isLoading: false });

	@Effect()
	loadCategoryPage$ = this.actions$
		.pipe(
			ofType<CategoryPageRequested>(CategoryActionTypes.CategoryPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.category.getListCategory(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryCategoryModel = response[1];
				return new CategoryPageLoaded({
					category: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteCategory$ = this.actions$
		.pipe(
			ofType<CategoryDeleted>(CategoryActionTypes.CategoryDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.category.deleteCategory(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateCategory = this.actions$
		.pipe(
			ofType<CategoryUpdated>(CategoryActionTypes.CategoryUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.category.updateCategory(payload.category);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<CategoryOnServerCreated>(CategoryActionTypes.CategoryOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.category.createCategory(payload.category).pipe(
					tap(res => {
						this.store.dispatch(new CategoryCreated({ category: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private category: CategoryService, private store: Store<AppState>) { }
}
