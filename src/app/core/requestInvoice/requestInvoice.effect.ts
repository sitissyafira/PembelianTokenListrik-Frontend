import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../_base/crud';
import { RequestInvoiceService } from './requestInvoice.service';
import { AppState } from '../../core/reducers';
import {
	RequestInvoiceActionTypes,
	RequestInvoicePageRequested,
	RequestInvoicePageLoaded,
	RequestInvoiceCreated,
	RequestInvoiceDeleted,
	RequestInvoiceUpdated,
	RequestInvoiceOnServerCreated,
	RequestInvoiceActionToggleLoading,
	RequestInvoicePageToggleLoading
} from './requestInvoice.action';
import { QueryRequestInvoiceModel } from './queryrequestInvoice.model';


@Injectable()
export class RequestInvoiceEffect {
	showPageLoadingDistpatcher = new RequestInvoicePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new RequestInvoicePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new RequestInvoiceActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new RequestInvoiceActionToggleLoading({ isLoading: false });

	@Effect()
	loadRequestInvoicePage$ = this.actions$
		.pipe(
			ofType<RequestInvoicePageRequested>(RequestInvoiceActionTypes.RequestInvoicePageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.requestInvoice.getListRequestInvoice(payload.page)
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
				const lastQuery: QueryRequestInvoiceModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new RequestInvoicePageLoaded({
					requestInvoice: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new RequestInvoicePageLoaded({
						requestInvoice: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteRequestInvoice$ = this.actions$
		.pipe(
			ofType<RequestInvoiceDeleted>(RequestInvoiceActionTypes.RequestInvoiceDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.requestInvoice.deleteRequestInvoice(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateRequestInvoice = this.actions$
		.pipe(
			ofType<RequestInvoiceUpdated>(RequestInvoiceActionTypes.RequestInvoiceUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.requestInvoice.updateRequestInvoice(payload.requestInvoice);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<RequestInvoiceOnServerCreated>(RequestInvoiceActionTypes.RequestInvoiceOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.requestInvoice.createRequestInvoice(payload.requestInvoice).pipe(
					tap(res => {
						this.store.dispatch(new RequestInvoiceCreated({ requestInvoice: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private requestInvoice: RequestInvoiceService, private store: Store<AppState>) { }
}
