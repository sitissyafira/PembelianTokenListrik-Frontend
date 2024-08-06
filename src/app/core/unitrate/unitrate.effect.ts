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
import { UnitRateService } from './unitrate.service';
// State
import { AppState } from '../../core/reducers';
import {
	UnitRateActionTypes,
	UnitRatePageRequested,
	UnitRatePageLoaded,
	UnitRateCreated,
	UnitRateDeleted,
	UnitRateUpdated,
	UnitRateOnServerCreated,
	UnitRateActionToggleLoading,
	UnitRatePageToggleLoading
} from './unitrate.action';
import {QueryParamsModel} from '../_base/crud/models/query-models/query-params.model';

@Injectable()
export class UnitRateEffect {
	showPageLoadingDistpatcher = new UnitRatePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new UnitRatePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new UnitRateActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new UnitRateActionToggleLoading({ isLoading: false });

	@Effect()
	loadUnitRatePage$ = this.actions$
		.pipe(
			ofType<UnitRatePageRequested>(UnitRateActionTypes.UnitRatePageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.unitrate.getListUnitRate(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryParamsModel = response[1];
				return new UnitRatePageLoaded({
					unitrate: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteUnitRate$ = this.actions$
		.pipe(
			ofType<UnitRateDeleted>(UnitRateActionTypes.UnitRateDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.unitrate.deleteUnitRate(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateUnitRate = this.actions$
		.pipe(
			ofType<UnitRateUpdated>(UnitRateActionTypes.UnitRateUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.unitrate.updateUnitRate(payload.unitrate);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<UnitRateOnServerCreated>(UnitRateActionTypes.UnitRateOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.unitrate.createUnitRate(payload.unitrate).pipe(
					tap(res => {
						this.store.dispatch(new UnitRateCreated({ unitrate: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private unitrate: UnitRateService, private store: Store<AppState>) { }
}
