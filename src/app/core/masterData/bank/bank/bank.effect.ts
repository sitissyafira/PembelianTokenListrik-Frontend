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
import { BankService } from './bank.service';
// State
import { AppState } from '../../../../core/reducers';
import {
	BankActionTypes,
	BankPageRequested,
	BankPageLoaded,
	BankCreated,
	BankDeleted,
	BankUpdated,
	BankOnServerCreated,
	BankActionToggleLoading,
	BankPageToggleLoading
} from './bank.action';
import { QueryBankModel } from './querybank.model';


@Injectable()
export class BankEffect {
	showPageLoadingDistpatcher = new BankPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new BankPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new BankActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new BankActionToggleLoading({ isLoading: false });

	@Effect()
	loadBankPage$ = this.actions$
		.pipe(
			ofType<BankPageRequested>(BankActionTypes.BankPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.bank.getListBank(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryBankModel = response[1];
				return new BankPageLoaded({
					bank: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteBank$ = this.actions$
		.pipe(
			ofType<BankDeleted>(BankActionTypes.BankDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.bank.deleteBank(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateBank = this.actions$
		.pipe(
			ofType<BankUpdated>(BankActionTypes.BankUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.bank.updateBank(payload.bank);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<BankOnServerCreated>(BankActionTypes.BankOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.bank.createBank(payload.bank).pipe(
					tap(res => {
						this.store.dispatch(new BankCreated({ bank: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private bank: BankService, private store: Store<AppState>) { }
}
