import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { PurchaseOrderService } from './purchaseOrder.service';
import { AppState } from '../../../core/reducers';
import {
	PurchaseOrderActionTypes,
	PurchaseOrderPageRequested,
	PurchaseOrderPageLoaded,
	PurchaseOrderCreated,
	PurchaseOrderDeleted,
	PurchaseOrderUpdated,
	PurchaseOrderOnServerCreated,
	PurchaseOrderActionToggleLoading,
	PurchaseOrderPageToggleLoading
} from './purchaseOrder.action';
import { QueryPurchaseOrderModel } from './querypurchaseOrder.model';


@Injectable()
export class PurchaseOrderEffect {
	showPageLoadingDistpatcher = new PurchaseOrderPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PurchaseOrderPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PurchaseOrderActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PurchaseOrderActionToggleLoading({ isLoading: false });

	@Effect()
	loadPurchaseOrderPage$ = this.actions$
		.pipe(
			ofType<PurchaseOrderPageRequested>(PurchaseOrderActionTypes.PurchaseOrderPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.purchaseOrder.getListPurchaseOrder(payload.page)
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
				const lastQuery: QueryPurchaseOrderModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new PurchaseOrderPageLoaded({
					purchaseOrder: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new PurchaseOrderPageLoaded({
						purchaseOrder: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deletePurchaseOrder$ = this.actions$
		.pipe(
			ofType<PurchaseOrderDeleted>(PurchaseOrderActionTypes.PurchaseOrderDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.purchaseOrder.deletePurchaseOrder(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePurchaseOrder = this.actions$
		.pipe(
			ofType<PurchaseOrderUpdated>(PurchaseOrderActionTypes.PurchaseOrderUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.purchaseOrder.updatePurchaseOrder(payload.purchaseOrder);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PurchaseOrderOnServerCreated>(PurchaseOrderActionTypes.PurchaseOrderOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.purchaseOrder.createPurchaseOrder(payload.purchaseOrder).pipe(
					tap(res => {
						this.store.dispatch(new PurchaseOrderCreated({ purchaseOrder: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private purchaseOrder: PurchaseOrderService, private store: Store<AppState>) { }
}
