import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { PurchaseRequestService } from './purchaseRequest.service';
import { AppState } from '../../../core/reducers';
import {
	PurchaseRequestActionTypes,
	PurchaseRequestPageRequested,
	PurchaseRequestPageLoaded,
	PurchaseRequestCreated,
	PurchaseRequestDeleted,
	PurchaseRequestUpdated,
	PurchaseRequestOnServerCreated,
	PurchaseRequestActionToggleLoading,
	PurchaseRequestPageToggleLoading
} from './purchaseRequest.action';
import { QueryPurchaseRequestModel } from './querypurchaseRequest.model';


@Injectable()
export class PurchaseRequestEffect {
	showPageLoadingDistpatcher = new PurchaseRequestPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PurchaseRequestPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PurchaseRequestActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PurchaseRequestActionToggleLoading({ isLoading: false });

	@Effect()
	loadPurchaseRequestPage$ = this.actions$
		.pipe(
			ofType<PurchaseRequestPageRequested>(PurchaseRequestActionTypes.PurchaseRequestPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.purchaseRequest.getListPurchaseRequest(payload.page)
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
				const lastQuery: QueryPurchaseRequestModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new PurchaseRequestPageLoaded({
					purchaseRequest: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new PurchaseRequestPageLoaded({
						purchaseRequest: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deletePurchaseRequest$ = this.actions$
		.pipe(
			ofType<PurchaseRequestDeleted>(PurchaseRequestActionTypes.PurchaseRequestDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.purchaseRequest.deletePurchaseRequest(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePurchaseRequest = this.actions$
		.pipe(
			ofType<PurchaseRequestUpdated>(PurchaseRequestActionTypes.PurchaseRequestUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.purchaseRequest.updatePurchaseRequest(payload.purchaseRequest);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PurchaseRequestOnServerCreated>(PurchaseRequestActionTypes.PurchaseRequestOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.purchaseRequest.createPurchaseRequest(payload.purchaseRequest).pipe(
					tap(res => {
						this.store.dispatch(new PurchaseRequestCreated({ purchaseRequest: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private purchaseRequest: PurchaseRequestService, private store: Store<AppState>) { }
}
