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
import { VehicleTypeService } from './vehicletype.service';
// State
import { AppState } from '../../core/reducers';
import {
	VehicleTypeActionTypes,
	VehicleTypePageRequested,
	VehicleTypePageLoaded,
	VehicleTypeCreated,
	VehicleTypeDeleted,
	VehicleTypeUpdated,
	VehicleTypeOnServerCreated,
	VehicleTypeActionToggleLoading,
	VehicleTypePageToggleLoading
} from './vehicletype.action';
import {QueryParamsModel} from '../_base/crud/models/query-models/query-params.model';

@Injectable()
export class VehicleTypeEffect {
	showPageLoadingDistpatcher = new VehicleTypePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new VehicleTypePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new VehicleTypeActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new VehicleTypeActionToggleLoading({ isLoading: false });

	@Effect()
	loadVehicleTypePage$ = this.actions$
		.pipe(
			ofType<VehicleTypePageRequested>(VehicleTypeActionTypes.VehicleTypePageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.vehicletype.getListVehicleType(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryParamsModel = response[1];
				return new VehicleTypePageLoaded({
					vehicletype: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteVehicleType$ = this.actions$
		.pipe(
			ofType<VehicleTypeDeleted>(VehicleTypeActionTypes.VehicleTypeDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.vehicletype.deleteVehicleType(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateVehicleType = this.actions$
		.pipe(
			ofType<VehicleTypeUpdated>(VehicleTypeActionTypes.VehicleTypeUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.vehicletype.updateVehicleType(payload.vehicletype);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createVehicleType$ = this.actions$
		.pipe(
			ofType<VehicleTypeOnServerCreated>(VehicleTypeActionTypes.VehicleTypeOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.vehicletype.createVehicleType(payload.vehicletype).pipe(
					tap(res => {
						this.store.dispatch(new VehicleTypeCreated({ vehicletype: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private vehicletype: VehicleTypeService, private store: Store<AppState>) { }
}
