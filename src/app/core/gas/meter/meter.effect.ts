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
import { GasMeterService } from './meter.service';
// State
import { AppState } from '../../../core/reducers';
import {
	GasMeterActionTypes,
	GasMeterPageRequested,
	GasMeterPageLoaded,
	GasMeterCreated,
	GasMeterDeleted,
	GasMeterUpdated,
	GasMeterOnServerCreated,
	GasMeterActionToggleLoading,
	GasMeterPageToggleLoading
} from './meter.action';
import {QueryGasMeterModel} from './querymeter.model';

@Injectable()
export class GasMeterEffect {
	showPageLoadingDistpatcher = new GasMeterPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new GasMeterPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new GasMeterActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new GasMeterActionToggleLoading({ isLoading: false });

	@Effect()
	loadGasMeterPage$ = this.actions$
		.pipe(
			ofType<GasMeterPageRequested>(GasMeterActionTypes.GasMeterPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.gasmeter.getListGasMeter(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: '', data: [] };
				const lastQuery: QueryGasMeterModel = response[1];
				return new GasMeterPageLoaded({
					gasmeter: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteGasMeter$ = this.actions$
		.pipe(
			ofType<GasMeterDeleted>(GasMeterActionTypes.GasMeterDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.gasmeter.deleteGasMeter(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateGasMeter = this.actions$
		.pipe(
			ofType<GasMeterUpdated>(GasMeterActionTypes.GasMeterUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.gasmeter.updateGasMeter(payload.gasmeter);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<GasMeterOnServerCreated>(GasMeterActionTypes.GasMeterOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.gasmeter.createGasMeter(payload.gasmeter).pipe(
					tap(res => {
						this.store.dispatch(new GasMeterCreated({ gasmeter: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private gasmeter: GasMeterService, private store: Store<AppState>) { }
}
