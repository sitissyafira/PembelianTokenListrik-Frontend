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
import { RentalbillingService } from './rentalbilling.service';
// State
import { AppState } from '../reducers';
import {
	RentalbillingActionTypes,
	RentalbillingPageRequested,
	RentalbillingPageLoaded,
	RentalbillingCreated,
	RentalbillingDeleted,
	RentalbillingUpdated,
	RentalbillingOnServerCreated,
	RentalbillingActionToggleLoading,
	RentalbillingPageToggleLoading
} from './rentalbilling.action';
import { QueryRentalbillingModel } from './queryrentalbilling.model';


@Injectable()
export class RentalbillingEffect {
	showPageLoadingDistpatcher = new RentalbillingPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new RentalbillingPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new RentalbillingActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new RentalbillingActionToggleLoading({ isLoading: false });

	@Effect()
	loadRentalbillingPage$ = this.actions$
		.pipe(
			ofType<RentalbillingPageRequested>(RentalbillingActionTypes.RentalbillingPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.rentalbilling.getListRentalbilling(payload.page);
				console.log(requestToServer, "tes get list")
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryRentalbillingModel = response[1];
				return new RentalbillingPageLoaded({
					rentalbilling: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteRentalbilling$ = this.actions$
		.pipe(
			ofType<RentalbillingDeleted>(RentalbillingActionTypes.RentalbillingDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.rentalbilling.deleteRentalbilling(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateRentalbilling = this.actions$
		.pipe(
			ofType<RentalbillingUpdated>(RentalbillingActionTypes.RentalbillingUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.rentalbilling.updateRentalbilling(payload.rentalbilling);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<RentalbillingOnServerCreated>(RentalbillingActionTypes.RentalbillingOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.rentalbilling.createRentalbilling(payload.rentalbilling).pipe(
					tap(res => {
						this.store.dispatch(new RentalbillingCreated({ rentalbilling: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private rentalbilling: RentalbillingService, private store: Store<AppState>) { }
}
