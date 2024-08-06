// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../_base/crud';
// Services
import { DepositService } from './deposit.service';
// State
import { AppState } from '../../core/reducers';
import {
	DepositActionTypes,
	DepositPageRequested,
	DepositPageLoaded,
	DepositCreated,
	DepositDeleted,
	DepositUpdated,
	DepositOnServerCreated,
	DepositActionToggleLoading,
	DepositPageToggleLoading
} from './deposit.action';
import {QueryDepositModel} from './querydeposit.model';

@Injectable()
export class DepositEffect {
	showPageLoadingDistpatcher = new DepositPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new DepositPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new DepositActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new DepositActionToggleLoading({ isLoading: false });

	@Effect()
	loadDepositPage$ = this.actions$
		.pipe(
			ofType<DepositPageRequested>(DepositActionTypes.DepositPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.deposit.getListDeposit(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryDepositModel = response[1];
				return new DepositPageLoaded({
					deposit: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteDeposit$ = this.actions$
		.pipe(
			ofType<DepositDeleted>(DepositActionTypes.DepositDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.deposit.deleteDeposit(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateDeposit$ = this.actions$
		.pipe(
			ofType<DepositUpdated>(DepositActionTypes.DepositUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.deposit.updateDeposit(payload.deposit);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createDeposit$ = this.actions$
		.pipe(
			ofType<DepositOnServerCreated>(DepositActionTypes.DepositOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.deposit.createDeposit(payload.deposit).pipe(
					tap(res => {
						this.store.dispatch(new DepositCreated({ deposit: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private deposit: DepositService, private store: Store<AppState>) { }
}
