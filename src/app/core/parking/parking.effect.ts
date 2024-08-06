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
import { ParkingService } from './parking.service';
// State
import { AppState } from '../../core/reducers';
import {
	ParkingActionTypes,
	ParkingPageRequested,
	ParkingPageLoaded,
	ParkingCreated,
	ParkingDeleted,
	ParkingUpdated,
	ParkingOnServerCreated,
	ParkingActionToggleLoading,
	ParkingPageToggleLoading
} from './parking.action';
import { QueryParkingModel } from './queryparking.model';


@Injectable()
export class ParkingEffect {
	showPageLoadingDistpatcher = new ParkingPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ParkingPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ParkingActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ParkingActionToggleLoading({ isLoading: false });

	@Effect()
	loadParkingPage$ = this.actions$
		.pipe(
			ofType<ParkingPageRequested>(ParkingActionTypes.ParkingPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.parking.getListParking(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryParkingModel = response[1];
				return new ParkingPageLoaded({
					parking: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteParking$ = this.actions$
		.pipe(
			ofType<ParkingDeleted>(ParkingActionTypes.ParkingDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.parking.deleteParking(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateParking = this.actions$
		.pipe(
			ofType<ParkingUpdated>(ParkingActionTypes.ParkingUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.parking.updateParking(payload.parking);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<ParkingOnServerCreated>(ParkingActionTypes.ParkingOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.parking.createParking(payload.parking).pipe(
					tap(res => {
						this.store.dispatch(new ParkingCreated({ parking: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private parking: ParkingService, private store: Store<AppState>) { }
}
