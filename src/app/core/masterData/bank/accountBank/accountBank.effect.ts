// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../../_base/crud';
// Services
import { AccountBankService } from './accountBank.service';
// State
import { AppState } from '../../../../core/reducers';
import {
	AccountBankActionTypes,
	AccountBankPageRequested,
	AccountBankPageLoaded,
	AccountBankCreated,
	AccountBankDeleted,
	AccountBankUpdated,
	AccountBankOnServerCreated,
	AccountBankActionToggleLoading,
	AccountBankPageToggleLoading
} from './accountBank.action';
import { QueryAccountBankModel } from './queryaccountBank.model';


@Injectable()
export class AccountBankEffect {
	showPageLoadingDistpatcher = new AccountBankPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new AccountBankPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new AccountBankActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new AccountBankActionToggleLoading({ isLoading: false });

	@Effect()
	loadAccountBankPage$ = this.actions$
		.pipe(
			ofType<AccountBankPageRequested>(AccountBankActionTypes.AccountBankPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.accountBank.getListAccountBank(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryAccountBankModel = response[1];
				return new AccountBankPageLoaded({
					accountBank: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteAccountBank$ = this.actions$
		.pipe(
			ofType<AccountBankDeleted>(AccountBankActionTypes.AccountBankDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.accountBank.deleteAccountBank(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateAccountBank = this.actions$
		.pipe(
			ofType<AccountBankUpdated>(AccountBankActionTypes.AccountBankUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.accountBank.updateAccountBank(payload.accountBank);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<AccountBankOnServerCreated>(AccountBankActionTypes.AccountBankOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.accountBank.createAccountBank(payload.accountBank).pipe(
					tap(res => {
						this.store.dispatch(new AccountBankCreated({ accountBank: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private accountBank: AccountBankService, private store: Store<AppState>) { }
}
