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
import { UnitService } from './unit.service';
// State
import { AppState } from '../../core/reducers';
import {
	UnitActionTypes,
	UnitPageRequested,
	UnitPageLoaded,
	UnitCreated,
	UnitDeleted,
	UnitUpdated,
	UnitOnServerCreated,
	UnitActionToggleLoading,
	UnitPageToggleLoading
} from './unit.action';
import {QueryUnitModel} from './queryunit.model';

@Injectable()
export class UnitEffect {
	showPageLoadingDistpatcher = new UnitPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new UnitPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new UnitActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new UnitActionToggleLoading({ isLoading: false });

	@Effect()
	loadUnitPage$ = this.actions$
		.pipe(
			ofType<UnitPageRequested>(UnitActionTypes.UnitPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.unit.getListUnit(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryUnitModel = response[1];
				return new UnitPageLoaded({
					unit: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteUnit$ = this.actions$
		.pipe(
			ofType<UnitDeleted>(UnitActionTypes.UnitDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.unit.deleteUnit(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateUnit = this.actions$
		.pipe(
			ofType<UnitUpdated>(UnitActionTypes.UnitUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.unit.updateUnit(payload.unit);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<UnitOnServerCreated>(UnitActionTypes.UnitOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.unit.createUnit(payload.unit).pipe(
					tap(res => {
						this.store.dispatch(new UnitCreated({ unit: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private unit: UnitService, private store: Store<AppState>) { }
}
