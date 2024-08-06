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
import { DeliveryorderService } from './deliveryorder.service';
// State
import { AppState } from '../../core/reducers';
import {
	DeliveryorderActionTypes,
	DeliveryorderPageRequested,
	DeliveryorderPageLoaded,
	DeliveryorderCreated,
	DeliveryorderDeleted,
	DeliveryorderUpdated,
	DeliveryorderOnServerCreated,
	DeliveryorderActionToggleLoading,
	DeliveryorderPageToggleLoading,
	DeliveryorderPageRequestedVisit,
	DeliveryorderPageRequestedFixed
} from './deliveryorder.action';
import { QueryDeliveryorderModel } from './querydeliveryorder.model';


@Injectable()
export class DeliveryorderEffect {
	showPageLoadingDistpatcher = new DeliveryorderPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new DeliveryorderPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new DeliveryorderActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new DeliveryorderActionToggleLoading({ isLoading: false });

	@Effect()
	loadDeliveryorderPage$ = this.actions$
		.pipe(
			ofType<DeliveryorderPageRequested>(DeliveryorderActionTypes.DeliveryorderPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.deliveryorder.getListDeliveryorder(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryDeliveryorderModel = response[1];
				return new DeliveryorderPageLoaded({
					deliveryorder: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);
	
		@Effect()
		loadDeliveryorderPageVisit$ = this.actions$
		.pipe(
			ofType<DeliveryorderPageRequestedVisit>(DeliveryorderActionTypes.DeliveryorderPageRequestedVisit),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.deliveryorder.getListVisit(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryDeliveryorderModel = response[1];
				return new DeliveryorderPageLoaded({
					deliveryorder: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

		@Effect()
		loadDeliveryorderPageFixed$ = this.actions$
		.pipe(
			ofType<DeliveryorderPageRequestedFixed>(DeliveryorderActionTypes.DeliveryorderPageRequestedFixed),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.deliveryorder.getListFixed(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryDeliveryorderModel = response[1];
				return new DeliveryorderPageLoaded({
					deliveryorder: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteDeliveryorder$ = this.actions$
		.pipe(
			ofType<DeliveryorderDeleted>(DeliveryorderActionTypes.DeliveryorderDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.deliveryorder.deleteDeliveryorder(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateDeliveryorder = this.actions$
		.pipe(
			ofType<DeliveryorderUpdated>(DeliveryorderActionTypes.DeliveryorderUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.deliveryorder.updateDeliveryorder(payload.deliveryorder);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<DeliveryorderOnServerCreated>(DeliveryorderActionTypes.DeliveryorderOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.deliveryorder.createDeliveryorder(payload.deliveryorder).pipe(
					tap(res => {
						this.store.dispatch(new DeliveryorderCreated({ deliveryorder: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private deliveryorder: DeliveryorderService, private store: Store<AppState>) { }
}
