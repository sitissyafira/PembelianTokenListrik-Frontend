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
import { PinaltyService } from './pinalty.service';
// State
import { AppState } from '../../core/reducers';
import {
	PinaltyActionTypes,
	PinaltyPageRequested,
	PinaltyPageLoaded,
	PinaltyCreated,
	PinaltyDeleted,
	PinaltyUpdated,
	PinaltyOnServerCreated,
	PinaltyActionToggleLoading,
	PinaltyPageToggleLoading
} from './pinalty.action';
import {QueryParamsModel} from '../_base/crud/models/query-models/query-params.model';

@Injectable()
export class PinaltyEffect {
	showPageLoadingDistpatcher = new PinaltyPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PinaltyPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PinaltyActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PinaltyActionToggleLoading({ isLoading: false });

	@Effect()
	loadPinaltyPage$ = this.actions$
		.pipe(
			ofType<PinaltyPageRequested>(PinaltyActionTypes.PinaltyPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.pinalty.getListPinalty(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryParamsModel = response[1];
				return new PinaltyPageLoaded({
					pinalty: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deletePinalty$ = this.actions$
		.pipe(
			ofType<PinaltyDeleted>(PinaltyActionTypes.PinaltyDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.pinalty.deletePinalty(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePinalty = this.actions$
		.pipe(
			ofType<PinaltyUpdated>(PinaltyActionTypes.PinaltyUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.pinalty.updatePinalty(payload.pinalty);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PinaltyOnServerCreated>(PinaltyActionTypes.PinaltyOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.pinalty.createPinalty(payload.pinalty).pipe(
					tap(res => {
						this.store.dispatch(new PinaltyCreated({ pinalty: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private pinalty: PinaltyService, private store: Store<AppState>) { }
}
