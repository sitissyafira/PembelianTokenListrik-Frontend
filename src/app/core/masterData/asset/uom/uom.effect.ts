// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../../_base/crud';
// Services
import { UomService } from './uom.service';
// State
import { AppState } from '../../../../core/reducers';
import {
	UomActionTypes,
	UomPageRequested,
	UomPageLoaded,
	UomCreated,
	UomDeleted,
	UomUpdated,
	UomOnServerCreated,
	UomActionToggleLoading,
	UomPageToggleLoading
} from './uom.action';
import { QueryUomModel } from './queryuom.model';


@Injectable()
export class UomEffect {
	showPageLoadingDistpatcher = new UomPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new UomPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new UomActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new UomActionToggleLoading({ isLoading: false });

	@Effect()
	loadUomPage$ = this.actions$
		.pipe(
			ofType<UomPageRequested>(UomActionTypes.UomPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.uom.getListUom(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryUomModel = response[1];
				return new UomPageLoaded({
					uom: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteUom$ = this.actions$
		.pipe(
			ofType<UomDeleted>(UomActionTypes.UomDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.uom.deleteUom(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateUom = this.actions$
		.pipe(
			ofType<UomUpdated>(UomActionTypes.UomUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.uom.updateUom(payload.uom);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<UomOnServerCreated>(UomActionTypes.UomOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.uom.createUom(payload.uom).pipe(
					tap(res => {
						this.store.dispatch(new UomCreated({ uom: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private uom: UomService, private store: Store<AppState>) { }
}
