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
import { CashbService } from './cashb.service';
// State
import { AppState } from '../../core/reducers';
import {
	CashbActionTypes,
	CashbPageRequested,
	CashbPageLoaded,
	CashbCreated,
	CashbDeleted,
	CashbUpdated,
	CashbOnServerCreated,
	CashbActionToggleLoading,
	CashbPageToggleLoading
} from './cashb.action';
import { QueryCashbModel } from './queryb.model';


@Injectable()
export class CashbEffect {
	showPageLoadingDistpatcher = new CashbPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new CashbPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new CashbActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new CashbActionToggleLoading({ isLoading: false });

	@Effect()
	loadCashbPage$ = this.actions$
		.pipe(
			ofType<CashbPageRequested>(CashbActionTypes.CashbPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.cashb.getListCashb(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryCashbModel = response[1];
				return new CashbPageLoaded({
					cashb: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteCashb$ = this.actions$
		.pipe(
			ofType<CashbDeleted>(CashbActionTypes.CashbDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.cashb.deleteCashb(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateCashb = this.actions$
		.pipe(
			ofType<CashbUpdated>(CashbActionTypes.CashbUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.cashb.updateCashb(payload.cashb);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<CashbOnServerCreated>(CashbActionTypes.CashbOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.cashb.createCashb(payload.cashb).pipe(
					tap(res => {
						this.store.dispatch(new CashbCreated({ cashb: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private cashb: CashbService, private store: Store<AppState>) { }
}
