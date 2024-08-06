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
import { UnitTypeService } from './unittype.service';
// State
import { AppState } from '../../core/reducers';
import {
	UnitTypeActionTypes,
	UnitTypePageRequested,
	UnitTypePageLoaded,
	UnitTypeCreated,
	UnitTypeDeleted,
	UnitTypeUpdated,
	UnitTypeOnServerCreated,
	UnitTypeActionToggleLoading,
	UnitTypePageToggleLoading
} from './unittype.action';
import {QueryParamsModel} from '../_base/crud/models/query-models/query-params.model';

@Injectable()
export class UnitTypeEffect {
	showPageLoadingDistpatcher = new UnitTypePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new UnitTypePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new UnitTypeActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new UnitTypeActionToggleLoading({ isLoading: false });

	@Effect()
	loadUnitTypePage$ = this.actions$
		.pipe(
			ofType<UnitTypePageRequested>(UnitTypeActionTypes.UnitTypePageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.unittype.getListUnitType(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryParamsModel = response[1];
				return new UnitTypePageLoaded({
					unittype: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteUnitType$ = this.actions$
		.pipe(
			ofType<UnitTypeDeleted>(UnitTypeActionTypes.UnitTypeDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.unittype.deleteUnitType(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateUnitType = this.actions$
		.pipe(
			ofType<UnitTypeUpdated>(UnitTypeActionTypes.UnitTypeUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.unittype.updateUnitType(payload.unittype);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<UnitTypeOnServerCreated>(UnitTypeActionTypes.UnitTypeOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.unittype.createUnitType(payload.unittype).pipe(
					tap(res => {
						this.store.dispatch(new UnitTypeCreated({ unittype: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private unittype: UnitTypeService, private store: Store<AppState>) { }
}
