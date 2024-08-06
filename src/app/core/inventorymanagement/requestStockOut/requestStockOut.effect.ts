import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { RequestStockOutService } from './requestStockOut.service';
import { AppState } from '../../../core/reducers';
import {
	RequestStockOutActionTypes,
	RequestStockOutPageRequested,
	RequestStockOutPageLoaded,
	RequestStockOutCreated,
	RequestStockOutDeleted,
	RequestStockOutUpdated,
	RequestStockOutOnServerCreated,
	RequestStockOutActionToggleLoading,
	RequestStockOutPageToggleLoading
} from './requestStockOut.action';
import { QueryRequestStockOutModel } from './queryrequestStockOut.model';


@Injectable()
export class RequestStockOutEffect {
	showPageLoadingDistpatcher = new RequestStockOutPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new RequestStockOutPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new RequestStockOutActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new RequestStockOutActionToggleLoading({ isLoading: false });

	@Effect()
	loadRequestStockOutPage$ = this.actions$
		.pipe(
			ofType<RequestStockOutPageRequested>(RequestStockOutActionTypes.RequestStockOutPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.requestStockOut.getListRequestStockOut(payload.page)
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
				const lastQuery: QueryRequestStockOutModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new RequestStockOutPageLoaded({
					requestStockOut: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new RequestStockOutPageLoaded({
						requestStockOut: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteRequestStockOut$ = this.actions$
		.pipe(
			ofType<RequestStockOutDeleted>(RequestStockOutActionTypes.RequestStockOutDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.requestStockOut.deleteRequestStockOut(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateRequestStockOut = this.actions$
		.pipe(
			ofType<RequestStockOutUpdated>(RequestStockOutActionTypes.RequestStockOutUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.requestStockOut.updateRequestStockOut(payload.requestStockOut);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<RequestStockOutOnServerCreated>(RequestStockOutActionTypes.RequestStockOutOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.requestStockOut.createRequestStockOut(payload.requestStockOut).pipe(
					tap(res => {
						this.store.dispatch(new RequestStockOutCreated({ requestStockOut: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private requestStockOut: RequestStockOutService, private store: Store<AppState>) { }
}
