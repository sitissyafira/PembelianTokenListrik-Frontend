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
import { PowerMeterService } from './meter.service';
// State
import { AppState } from '../../../core/reducers';
import {
	PowerMeterActionTypes,
	PowerMeterPageRequested,
	PowerMeterPageLoaded,
	PowerMeterCreated,
	PowerMeterDeleted,
	PowerMeterUpdated,
	PowerMeterOnServerCreated,
	PowerMeterActionToggleLoading,
	PowerMeterPageToggleLoading
} from './meter.action';
import {QueryPowerMeterModel} from './querymeter.model';

@Injectable()
export class PowerMeterEffect {
	showPageLoadingDistpatcher = new PowerMeterPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PowerMeterPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PowerMeterActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PowerMeterActionToggleLoading({ isLoading: false });

	@Effect()
	loadPowerMeterPage$ = this.actions$
		.pipe(
			ofType<PowerMeterPageRequested>(PowerMeterActionTypes.PowerMeterPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.powermeter.getListPowerMeter(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: '', data: [] };
				const lastQuery: QueryPowerMeterModel = response[1];
				return new PowerMeterPageLoaded({
					powermeter: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deletePowerMeter$ = this.actions$
		.pipe(
			ofType<PowerMeterDeleted>(PowerMeterActionTypes.PowerMeterDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.powermeter.deletePowerMeter(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePowerMeter = this.actions$
		.pipe(
			ofType<PowerMeterUpdated>(PowerMeterActionTypes.PowerMeterUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.powermeter.updatePowerMeter(payload.powermeter);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PowerMeterOnServerCreated>(PowerMeterActionTypes.PowerMeterOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.powermeter.createPowerMeter(payload.powermeter).pipe(
					tap(res => {
						this.store.dispatch(new PowerMeterCreated({ powermeter: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private powermeter: PowerMeterService, private store: Store<AppState>) { }
}
