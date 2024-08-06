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
import { AccountTypeService } from './accountType.service';
// State
import { AppState } from '../../core/reducers';
import {
	AccountTypeActionTypes,
	AccountTypePageRequested,
	AccountTypePageLoaded,
	AccountTypeCreated,
	AccountTypeDeleted,
	AccountTypeUpdated,
	AccountTypeOnServerCreated,
	AccountTypeActionToggleLoading,
	AccountTypePageToggleLoading
} from './accountType.action';
import { QueryAccountTypeModel } from './queryaccounttype.model';


@Injectable()
export class AccountTypeEffect {
	showPageLoadingDistpatcher = new AccountTypePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new AccountTypePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new AccountTypeActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new AccountTypeActionToggleLoading({ isLoading: false });

	@Effect()
	loadAccountTypePage$ = this.actions$
		.pipe(
			ofType<AccountTypePageRequested>(AccountTypeActionTypes.AccountTypePageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.accountType.getListAccountType(payload.page)
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
				const lastQuery: QueryAccountTypeModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new AccountTypePageLoaded({
					accountType: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new AccountTypePageLoaded({
						accountType: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteAccountType$ = this.actions$
		.pipe(
			ofType<AccountTypeDeleted>(AccountTypeActionTypes.AccountTypeDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.accountType.deleteAccountType(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateAccountType = this.actions$
		.pipe(
			ofType<AccountTypeUpdated>(AccountTypeActionTypes.AccountTypeUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.accountType.updateAccountType(payload.accountType);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<AccountTypeOnServerCreated>(AccountTypeActionTypes.AccountTypeOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.accountType.createAccountType(payload.accountType).pipe(
					tap(res => {
						this.store.dispatch(new AccountTypeCreated({ accountType: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private accountType: AccountTypeService, private store: Store<AppState>) { }
}
