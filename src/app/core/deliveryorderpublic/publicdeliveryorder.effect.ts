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
import { PublicDeliveryorderService } from './publicdeliveryorder.service';
// State
import { AppState } from '../reducers';
import {
	PublicDeliveryorderActionTypes,
	PublicDeliveryorderPageRequested,
	PublicDeliveryorderPageLoaded,
	PublicDeliveryorderCreated,
	PublicDeliveryorderDeleted,
	PublicDeliveryorderUpdated,
	PublicDeliveryorderOnServerCreated,
	PublicDeliveryorderActionToggleLoading,
	PublicDeliveryorderPageToggleLoading,
	PublicDeliveryorderPageRequestedVisit,
	PublicDeliveryorderPageRequestedFixed
} from './publicdeliveryorder.action';
import { QueryPublicDeliveryorderModel } from './querypublicdeliveryorder.model';


@Injectable()
export class PublicDeliveryorderEffect {
	showPageLoadingDistpatcher = new PublicDeliveryorderPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PublicDeliveryorderPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PublicDeliveryorderActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PublicDeliveryorderActionToggleLoading({ isLoading: false });

	@Effect()
	loadPublicDeliveryorderPage$ = this.actions$
		.pipe(
			ofType<PublicDeliveryorderPageRequested>(PublicDeliveryorderActionTypes.PublicDeliveryorderPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicDeliveryorder.getListPublicDeliveryorder(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryPublicDeliveryorderModel = response[1];
				return new PublicDeliveryorderPageLoaded({
					publicDeliveryorder: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);
	
		@Effect()
		loadPublicDeliveryorderPageVisit$ = this.actions$
		.pipe(
			ofType<PublicDeliveryorderPageRequestedVisit>(PublicDeliveryorderActionTypes.PublicDeliveryorderPageRequestedVisit),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicDeliveryorder.getListVisit(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryPublicDeliveryorderModel = response[1];
				return new PublicDeliveryorderPageLoaded({
					publicDeliveryorder: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

		@Effect()
		loadPublicDeliveryorderPageFixed$ = this.actions$
		.pipe(
			ofType<PublicDeliveryorderPageRequestedFixed>(PublicDeliveryorderActionTypes.PublicDeliveryorderPageRequestedFixed),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicDeliveryorder.getListFixed(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryPublicDeliveryorderModel = response[1];
				return new PublicDeliveryorderPageLoaded({
					publicDeliveryorder: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deletePublicDeliveryorder$ = this.actions$
		.pipe(
			ofType<PublicDeliveryorderDeleted>(PublicDeliveryorderActionTypes.PublicDeliveryorderDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.publicDeliveryorder.deletePublicDeliveryorder(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePublicDeliveryorder = this.actions$
		.pipe(
			ofType<PublicDeliveryorderUpdated>(PublicDeliveryorderActionTypes.PublicDeliveryorderUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.publicDeliveryorder.updatePublicDeliveryorder(payload.publicDeliveryorder);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PublicDeliveryorderOnServerCreated>(PublicDeliveryorderActionTypes.PublicDeliveryorderOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.publicDeliveryorder.createPublicDeliveryorder(payload.publicDeliveryorder).pipe(
					tap(res => {
						this.store.dispatch(new PublicDeliveryorderCreated({ publicDeliveryorder: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private publicDeliveryorder: PublicDeliveryorderService, private store: Store<AppState>) { }
}
