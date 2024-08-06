import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { LocationBuildingService } from './locationBuilding.service';
import { AppState } from '../../reducers';
import {
	LocationBuildingActionTypes,
	LocationBuildingPageRequested,
	LocationBuildingPageLoaded,
	LocationBuildingCreated,
	LocationBuildingDeleted,
	LocationBuildingUpdated,
	LocationBuildingOnServerCreated,
	LocationBuildingActionToggleLoading,
	LocationBuildingPageToggleLoading
} from './locationBuilding.action';
import { QueryLocationBuildingModel } from './querylocationBuilding.model';


@Injectable()
export class LocationBuildingEffect {
	showPageLoadingDistpatcher = new LocationBuildingPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new LocationBuildingPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new LocationBuildingActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new LocationBuildingActionToggleLoading({ isLoading: false });

	@Effect()
	loadLocationBuildingPage$ = this.actions$
		.pipe(
			ofType<LocationBuildingPageRequested>(LocationBuildingActionTypes.LocationBuildingPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.locationBuilding.getListLocationBuilding(payload.page)
				.pipe(
					catchError (err =>{
						return throwError(err);
					}),
					catchError(err => {
						return of (err)
					})
				);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map((response : any ) => {
				const lastQuery: QueryLocationBuildingModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new LocationBuildingPageLoaded({
					locationBuilding: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new LocationBuildingPageLoaded({
						locationBuilding: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteLocationBuilding$ = this.actions$
		.pipe(
			ofType<LocationBuildingDeleted>(LocationBuildingActionTypes.LocationBuildingDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.locationBuilding.deleteLocationBuilding(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateLocationBuilding = this.actions$
		.pipe(
			ofType<LocationBuildingUpdated>(LocationBuildingActionTypes.LocationBuildingUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.locationBuilding.updateLocationBuilding(payload.locationBuilding);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<LocationBuildingOnServerCreated>(LocationBuildingActionTypes.LocationBuildingOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.locationBuilding.createLocationBuilding(payload.locationBuilding).pipe(
					tap(res => {
						this.store.dispatch(new LocationBuildingCreated({ locationBuilding: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private locationBuilding: LocationBuildingService, private store: Store<AppState>) { }
}
