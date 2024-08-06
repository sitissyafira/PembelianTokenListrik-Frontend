// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { Observable, defer, of, forkJoin, throwError } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { FacilityService } from './facility.service';
// State
import { AppState } from '../../../core/reducers';
import {
	FacilityActionTypes,
	FacilityPageRequested,
	FacilityPageLoaded,
	FacilityCreated,
	FacilityDeleted,
	FacilityUpdated,
	FacilityOnServerCreated,
	FacilityActionToggleLoading,
	FacilityPageToggleLoading
} from './facility.action';
import { QueryFacilityModel } from './queryfacility.model';


@Injectable()
export class FacilityEffect {
	showPageLoadingDistpatcher = new FacilityPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new FacilityPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new FacilityActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new FacilityActionToggleLoading({ isLoading: false });

	@Effect()
	loadFacilityPage$ = this.actions$
		.pipe(
			ofType<FacilityPageRequested>(FacilityActionTypes.FacilityPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.facility.getListFacility(payload.page)
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
				const lastQuery: QueryFacilityModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new FacilityPageLoaded({
					facility: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new FacilityPageLoaded({
						facility: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteFacility$ = this.actions$
		.pipe(
			ofType<FacilityDeleted>(FacilityActionTypes.FacilityDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.facility.deleteFacility(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateFacility = this.actions$
		.pipe(
			ofType<FacilityUpdated>(FacilityActionTypes.FacilityUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.facility.updateFacility(payload.facility);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<FacilityOnServerCreated>(FacilityActionTypes.FacilityOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.facility.createFacility(payload.facility).pipe(
					tap(res => {
						this.store.dispatch(new FacilityCreated({ facility: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private facility: FacilityService, private store: Store<AppState>) { }
}
