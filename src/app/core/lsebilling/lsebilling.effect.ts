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
import { LsebillingService } from './lsebilling.service';
// State
import { AppState } from '../reducers';
import {
	LsebillingActionTypes,
	LsebillingPageRequested,
	LsebillingPageLoaded,
	LsebillingCreated,
	LsebillingDeleted,
	LsebillingUpdated,
	LsebillingOnServerCreated,
	LsebillingActionToggleLoading,
	LsebillingPageToggleLoading
} from './lsebilling.action';
import { QueryLsebillingModel } from './querylsebilling.model';


@Injectable()
export class LsebillingEffect {
	showPageLoadingDistpatcher = new LsebillingPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new LsebillingPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new LsebillingActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new LsebillingActionToggleLoading({ isLoading: false });

	@Effect()
	loadLsebillingPage$ = this.actions$
		.pipe(
			ofType<LsebillingPageRequested>(LsebillingActionTypes.LsebillingPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.lsebilling.getListLsebilling(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryLsebillingModel = response[1];
				return new LsebillingPageLoaded({
					lsebilling: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteLsebilling$ = this.actions$
		.pipe(
			ofType<LsebillingDeleted>(LsebillingActionTypes.LsebillingDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.lsebilling.deleteLsebilling(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateLsebilling = this.actions$
		.pipe(
			ofType<LsebillingUpdated>(LsebillingActionTypes.LsebillingUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.lsebilling.updateLsebilling(payload.lsebilling);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<LsebillingOnServerCreated>(LsebillingActionTypes.LsebillingOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.lsebilling.createLsebilling(payload.lsebilling).pipe(
					tap(res => {
						this.store.dispatch(new LsebillingCreated({ lsebilling: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private lsebilling: LsebillingService, private store: Store<AppState>) { }
}
