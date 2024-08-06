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
import { WaterMeterService } from './meter.service';
// State
import { AppState } from '../../../core/reducers';
import {
	WaterMeterActionTypes,
	WaterMeterPageRequested,
	WaterMeterPageLoaded,
	WaterMeterCreated,
	WaterMeterDeleted,
	WaterMeterUpdated,
	WaterMeterOnServerCreated,
	WaterMeterActionToggleLoading,
	WaterMeterPageToggleLoading
} from './meter.action';
import {QueryWaterMeterModel} from './querymeter.model';

@Injectable()
export class WaterMeterEffect {
	showPageLoadingDistpatcher = new WaterMeterPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new WaterMeterPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new WaterMeterActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new WaterMeterActionToggleLoading({ isLoading: false });

	@Effect()
	loadWaterMeterPage$ = this.actions$
		.pipe(
			ofType<WaterMeterPageRequested>(WaterMeterActionTypes.WaterMeterPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.watermeter.getListWaterMeter(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: '', data: [] };
				const lastQuery: QueryWaterMeterModel = response[1];
				return new WaterMeterPageLoaded({
					watermeter: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteWaterMeter$ = this.actions$
		.pipe(
			ofType<WaterMeterDeleted>(WaterMeterActionTypes.WaterMeterDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.watermeter.deleteWaterMeter(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateWaterMeter = this.actions$
		.pipe(
			ofType<WaterMeterUpdated>(WaterMeterActionTypes.WaterMeterUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.watermeter.updateWaterMeter(payload.watermeter);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<WaterMeterOnServerCreated>(WaterMeterActionTypes.WaterMeterOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.watermeter.createWaterMeter(payload.watermeter).pipe(
					tap(res => {
						this.store.dispatch(new WaterMeterCreated({ watermeter: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private watermeter: WaterMeterService, private store: Store<AppState>) { }
}
