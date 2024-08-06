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
import { AccountCategoryService } from './accountCategory.service';
// State
import { AppState } from '../reducers'
import {
	AccountCategoryActionTypes,
	AccountCategoryPageRequested,
	AccountCategoryPageLoaded,
	AccountCategoryCreated,
	AccountCategoryDeleted,
	AccountCategoryUpdated,
	AccountCategoryOnServerCreated,
	AccountCategoryActionToggleLoading,
	AccountCategoryPageToggleLoading
} from './accountCategory.action';
import { QueryAccountCategoryModel } from './queryaccountcategory.model';


@Injectable()
export class AccountCategoryEffect {
	showPageLoadingDistpatcher = new AccountCategoryPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new AccountCategoryPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new AccountCategoryActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new AccountCategoryActionToggleLoading({ isLoading: false });

	@Effect()
	loadAccountCategoryPage$ = this.actions$
		.pipe(
			ofType<AccountCategoryPageRequested>(AccountCategoryActionTypes.AccountCategoryPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.accountCategory.getListAccountCategory(payload.page)
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
				const lastQuery: QueryAccountCategoryModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new AccountCategoryPageLoaded({
					accountCategory: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new AccountCategoryPageLoaded({
						accountCategory: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteAccountCategory$ = this.actions$
		.pipe(
			ofType<AccountCategoryDeleted>(AccountCategoryActionTypes.AccountCategoryDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.accountCategory.deleteAccountCategory(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateAccountCategory = this.actions$
		.pipe(
			ofType<AccountCategoryUpdated>(AccountCategoryActionTypes.AccountCategoryUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.accountCategory.updateAccountCategory(payload.accountCategory);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<AccountCategoryOnServerCreated>(AccountCategoryActionTypes.AccountCategoryOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.accountCategory.createAccountCategory(payload.accountCategory).pipe(
					tap(res => {
						this.store.dispatch(new AccountCategoryCreated({ accountCategory: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private accountCategory: AccountCategoryService, private store: Store<AppState>) { }
}
