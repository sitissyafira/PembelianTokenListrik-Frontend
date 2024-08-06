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
import { PrkbillingService } from './prkbilling.service';
// State
import { AppState } from '../reducers';
import {
	PrkbillingActionTypes,
	PrkbillingPageRequested,
	PrkbillingPageLoaded,
	PrkbillingCreated,
	PrkbillingDeleted,
	PrkbillingUpdated,
	PrkbillingOnServerCreated,
	PrkbillingActionToggleLoading,
	PrkbillingPageToggleLoading
} from './prkbilling.action';
import { QueryPrkbillingModel } from './queryprkbilling.model';


@Injectable()
export class PrkbillingEffect {
	showPageLoadingDistpatcher = new PrkbillingPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PrkbillingPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PrkbillingActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PrkbillingActionToggleLoading({ isLoading: false });

	@Effect()
	loadPrkbillingPage$ = this.actions$
		.pipe(
			ofType<PrkbillingPageRequested>(PrkbillingActionTypes.PrkbillingPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.prkbilling.getListPrkbilling(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryPrkbillingModel = response[1];
				return new PrkbillingPageLoaded({
					prkbilling: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deletePrkbilling$ = this.actions$
		.pipe(
			ofType<PrkbillingDeleted>(PrkbillingActionTypes.PrkbillingDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.prkbilling.deletePrkbilling(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePrkbilling = this.actions$
		.pipe(
			ofType<PrkbillingUpdated>(PrkbillingActionTypes.PrkbillingUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.prkbilling.updatePrkbilling(payload.prkbilling);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PrkbillingOnServerCreated>(PrkbillingActionTypes.PrkbillingOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.prkbilling.createPrkbilling(payload.prkbilling).pipe(
					tap(res => {
						this.store.dispatch(new PrkbillingCreated({ prkbilling: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private prkbilling: PrkbillingService, private store: Store<AppState>) { }
}
