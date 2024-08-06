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
import { BuildingService } from './building.service';
// State
import { AppState } from '../../core/reducers';
import {
	BuildingActionTypes,
	BuildingPageRequested,
	BuildingPageLoaded,
	BuildingCreated,
	BuildingDeleted,
	BuildingUpdated,
	BuildingOnServerCreated,
	BuildingActionToggleLoading,
	BuildingPageToggleLoading
} from './building.action';
import {QueryBuildingModel} from './querybuilding.model';

@Injectable()
export class BuildingEffect {
	showPageLoadingDistpatcher = new BuildingPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new BuildingPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new BuildingActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new BuildingActionToggleLoading({ isLoading: false });

	@Effect()
	loadBuildingPage$ = this.actions$
		.pipe(
			ofType<BuildingPageRequested>(BuildingActionTypes.BuildingPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.building.getListBuilding(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].data.length, errorMessage: "", data:[] };
				const lastQuery: QueryBuildingModel = response[1];
				return new BuildingPageLoaded({
					building: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteBuilding$ = this.actions$
		.pipe(
			ofType<BuildingDeleted>(BuildingActionTypes.BuildingDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.building.deleteBuilding(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateBuilding = this.actions$
		.pipe(
			ofType<BuildingUpdated>(BuildingActionTypes.BuildingUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.building.updateBuilding(payload.building);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<BuildingOnServerCreated>(BuildingActionTypes.BuildingOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.building.createBuilding(payload.building).pipe(
					tap(res => {
						this.store.dispatch(new BuildingCreated({ building: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private building: BuildingService, private store: Store<AppState>) { }
}
