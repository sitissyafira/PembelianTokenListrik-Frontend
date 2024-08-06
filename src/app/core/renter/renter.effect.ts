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
import { RenterService } from './renter.service';
// State
import { AppState } from '../../core/reducers';
import {
	RenterActionTypes,
	RenterPageRequested,
	RenterPageLoaded,
	RenterCreated,
	RenterDeleted,
	RenterUpdated,
	RenterOnServerCreated,
	RenterActionToggleLoading,
	RenterPageToggleLoading
} from './renter.action';
import { QueryRenterModel } from './queryrenter.model';

@Injectable()
export class RenterEffect {
	showPageLoadingDistpatcher = new RenterPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new RenterPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new RenterActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new RenterActionToggleLoading({ isLoading: false });

	@Effect()
	loadRenterPage$ = this.actions$
		.pipe(
			ofType<RenterPageRequested>(RenterActionTypes.RenterPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.renter.getListRenter(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryRenterModel = response[1];
				return new RenterPageLoaded({
					renter: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteRenter$ = this.actions$
		.pipe(
			ofType<RenterDeleted>(RenterActionTypes.RenterDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.renter.deleteRenter(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateRenter = this.actions$
		.pipe(
			ofType<RenterUpdated>(RenterActionTypes.RenterUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.renter.updateRenter(payload.renter);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createRenter$ = this.actions$
		.pipe(
			ofType<RenterOnServerCreated>(RenterActionTypes.RenterOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.renter.createRenter(payload.renter).pipe(
					tap(res => {
						this.store.dispatch(new RenterCreated({ renter: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private renter: RenterService, private store: Store<AppState>) { }
}
