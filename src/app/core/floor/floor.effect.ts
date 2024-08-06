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
import { FloorService } from './floor.service';
// State
import { AppState } from '../../core/reducers';
import {
	FloorActionTypes,
	FloorPageRequested,
	FloorPageLoaded,
	FloorCreated,
	FloorDeleted,
	FloorUpdated,
	FloorOnServerCreated,
	FloorActionToggleLoading,
	FloorPageToggleLoading
} from './floor.action';
import {QueryFloorModel} from './queryfloor.model';

@Injectable()
export class FloorEffect {
	showPageLoadingDistpatcher = new FloorPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new FloorPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new FloorActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new FloorActionToggleLoading({ isLoading: false });

	@Effect()
	loadFloorPage$ = this.actions$
		.pipe(
			ofType<FloorPageRequested>(FloorActionTypes.FloorPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.floor.getListFloor(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryFloorModel = response[1];
				return new FloorPageLoaded({
					floor: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteFloor$ = this.actions$
		.pipe(
			ofType<FloorDeleted>(FloorActionTypes.FloorDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.floor.deleteFloor(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateFloor = this.actions$
		.pipe(
			ofType<FloorUpdated>(FloorActionTypes.FloorUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.floor.updateFloor(payload.floor);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<FloorOnServerCreated>(FloorActionTypes.FloorOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.floor.createFloor(payload.floor).pipe(
					tap(res => {
						this.store.dispatch(new FloorCreated({ floor: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private floor: FloorService, private store: Store<AppState>) { }
}
