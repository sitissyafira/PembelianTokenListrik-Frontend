// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { GasRateService } from './rate.service';
// State
import { AppState } from '../../../core/reducers';
import {
	GasRateActionTypes,
	GasRatePageRequested,
	GasRatePageLoaded,
	GasRateCreated,
	GasRateDeleted,
	GasRateUpdated,
	GasRateOnServerCreated,
	GasRateActionToggleLoading,
	GasRatePageToggleLoading
} from './rate.action';
import {QueryGasRateModel} from './queryrate.model';

@Injectable()
export class GasRateEffect {
	showPageLoadingDistpatcher = new GasRatePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new GasRatePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new GasRateActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new GasRateActionToggleLoading({ isLoading: false });

	@Effect()
	loadGasRatePage$ = this.actions$
		.pipe(
			ofType<GasRatePageRequested>(GasRateActionTypes.GasRatePageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.gasrate.getListGasRate(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: '', data: [] };
				const lastQuery: QueryGasRateModel = response[1];
				return new GasRatePageLoaded({
					gasrate: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteGasRate$ = this.actions$
		.pipe(
			ofType<GasRateDeleted>(GasRateActionTypes.GasRateDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.gasrate.deleteGasRate(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateGasRate = this.actions$
		.pipe(
			ofType<GasRateUpdated>(GasRateActionTypes.GasRateUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.gasrate.updateGasRate(payload.gasrate);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<GasRateOnServerCreated>(GasRateActionTypes.GasRateOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.gasrate.createGasRate(payload.gasrate).pipe(
					tap(res => {
						this.store.dispatch(new GasRateCreated({ gasrate: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private gasrate: GasRateService, private store: Store<AppState>) { }
}
