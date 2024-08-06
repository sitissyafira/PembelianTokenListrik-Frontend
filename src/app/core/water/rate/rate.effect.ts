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
import { WaterRateService } from './rate.service';
// State
import { AppState } from '../../../core/reducers';
import {
	WaterRateActionTypes,
	WaterRatePageRequested,
	WaterRatePageLoaded,
	WaterRateCreated,
	WaterRateDeleted,
	WaterRateUpdated,
	WaterRateOnServerCreated,
	WaterRateActionToggleLoading,
	WaterRatePageToggleLoading
} from './rate.action';
import {QueryWaterRateModel} from './queryrate.model';

@Injectable()
export class WaterRateEffect {
	showPageLoadingDistpatcher = new WaterRatePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new WaterRatePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new WaterRateActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new WaterRateActionToggleLoading({ isLoading: false });

	@Effect()
	loadWaterRatePage$ = this.actions$
		.pipe(
			ofType<WaterRatePageRequested>(WaterRateActionTypes.WaterRatePageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.waterrate.getListWaterRate(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: '', data: [] };
				const lastQuery: QueryWaterRateModel = response[1];
				return new WaterRatePageLoaded({
					waterrate: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteWaterRate$ = this.actions$
		.pipe(
			ofType<WaterRateDeleted>(WaterRateActionTypes.WaterRateDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.waterrate.deleteWaterRate(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateWaterRate = this.actions$
		.pipe(
			ofType<WaterRateUpdated>(WaterRateActionTypes.WaterRateUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.waterrate.updateWaterRate(payload.waterrate);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<WaterRateOnServerCreated>(WaterRateActionTypes.WaterRateOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.waterrate.createWaterRate(payload.waterrate).pipe(
					tap(res => {
						this.store.dispatch(new WaterRateCreated({ waterrate: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private waterrate: WaterRateService, private store: Store<AppState>) { }
}
