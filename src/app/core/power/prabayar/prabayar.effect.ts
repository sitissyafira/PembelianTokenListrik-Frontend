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
import { PowerPrabayarService } from './prabayar.service';
// State
import { AppState } from '../../reducers';
import {
	PowerPrabayarActionTypes,
	PowerPrabayarPageRequested,
	PowerPrabayarPageLoaded,
	PowerPrabayarCreated,
	PowerPrabayarDeleted,
	PowerPrabayarUpdated,
	PowerPrabayarOnServerCreated,
	PowerPrabayarActionToggleLoading,
	PowerPrabayarPageToggleLoading
} from './prabayar.action';
import {QueryPowerPrabayarModel} from './queryprabayar.model';

@Injectable()
export class PowerPrabayarEffect {
	showPageLoadingDistpatcher = new PowerPrabayarPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PowerPrabayarPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PowerPrabayarActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PowerPrabayarActionToggleLoading({ isLoading: false });

	@Effect()
	loadPowerPrabayarPage$ = this.actions$
		.pipe(
			ofType<PowerPrabayarPageRequested>(PowerPrabayarActionTypes.PowerPrabayarPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.powerprabayar.getListPowerPrabayar(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: '', data: [] };
				const lastQuery: QueryPowerPrabayarModel = response[1];
				return new PowerPrabayarPageLoaded({
					powerprabayar: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deletePowerPrabayar$ = this.actions$
		.pipe(
			ofType<PowerPrabayarDeleted>(PowerPrabayarActionTypes.PowerPrabayarDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.powerprabayar.deletePowerPrabayar(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePowerPrabayar = this.actions$
		.pipe(
			ofType<PowerPrabayarUpdated>(PowerPrabayarActionTypes.PowerPrabayarUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.powerprabayar.updatePowerPrabayar(payload.powerprabayar);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PowerPrabayarOnServerCreated>(PowerPrabayarActionTypes.PowerPrabayarOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.powerprabayar.createPowerPrabayar(payload.powerprabayar).pipe(
					tap(res => {
						this.store.dispatch(new PowerPrabayarCreated({ powerprabayar: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private powerprabayar: PowerPrabayarService, private store: Store<AppState>) { }
}
