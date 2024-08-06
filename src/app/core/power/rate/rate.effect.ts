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
import { PowerRateService } from './rate.service';
// State
import { AppState } from '../../../core/reducers';
import {
	PowerRateActionTypes,
	PowerRatePageRequested,
	PowerRatePageLoaded,
	PowerRateCreated,
	PowerRateDeleted,
	PowerRateUpdated,
	PowerRateOnServerCreated,
	PowerRateActionToggleLoading,
	PowerRatePageToggleLoading
} from './rate.action';
import {QueryPowerRateModel} from './queryrate.model';

@Injectable()
export class PowerRateEffect {
	showPageLoadingDistpatcher = new PowerRatePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PowerRatePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PowerRateActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PowerRateActionToggleLoading({ isLoading: false });

	@Effect()
	loadPowerRatePage$ = this.actions$
		.pipe(
			ofType<PowerRatePageRequested>(PowerRateActionTypes.PowerRatePageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.powerrate.getListPowerRate(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: '', data: [] };
				const lastQuery: QueryPowerRateModel = response[1];
				return new PowerRatePageLoaded({
					powerrate: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deletePowerRate$ = this.actions$
		.pipe(
			ofType<PowerRateDeleted>(PowerRateActionTypes.PowerRateDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.powerrate.deletePowerRate(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePowerRate = this.actions$
		.pipe(
			ofType<PowerRateUpdated>(PowerRateActionTypes.PowerRateUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.powerrate.updatePowerRate(payload.powerrate);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PowerRateOnServerCreated>(PowerRateActionTypes.PowerRateOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.powerrate.createPowerRate(payload.powerrate).pipe(
					tap(res => {
						this.store.dispatch(new PowerRateCreated({ powerrate: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private powerrate: PowerRateService, private store: Store<AppState>) { }
}
