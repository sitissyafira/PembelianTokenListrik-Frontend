import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../../_base/crud';
import { ComCustomerService } from './comCustomer.service';
import { AppState } from '../../../../core/reducers';
import {
	ComCustomerActionTypes,
	ComCustomerPageRequested,
	ComCustomerPageLoaded,
	ComCustomerCreated,
	ComCustomerDeleted,
	ComCustomerUpdated,
	ComCustomerOnServerCreated,
	ComCustomerActionToggleLoading,
	ComCustomerPageToggleLoading
} from './comCustomer.action';
import { QueryComCustomerModel } from './querycomCustomer.model';


@Injectable()
export class ComCustomerEffect {
	showPageLoadingDistpatcher = new ComCustomerPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ComCustomerPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ComCustomerActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ComCustomerActionToggleLoading({ isLoading: false });

	@Effect()
	loadComCustomerPage$ = this.actions$
		.pipe(
			ofType<ComCustomerPageRequested>(ComCustomerActionTypes.ComCustomerPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.comCustomer.getListComCustomer(payload.page)
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
				const lastQuery: QueryComCustomerModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new ComCustomerPageLoaded({
					comCustomer: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new ComCustomerPageLoaded({
						comCustomer: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteComCustomer$ = this.actions$
		.pipe(
			ofType<ComCustomerDeleted>(ComCustomerActionTypes.ComCustomerDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.comCustomer.deleteComCustomer(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateComCustomer = this.actions$
		.pipe(
			ofType<ComCustomerUpdated>(ComCustomerActionTypes.ComCustomerUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.comCustomer.updateComCustomer(payload.comCustomer);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<ComCustomerOnServerCreated>(ComCustomerActionTypes.ComCustomerOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.comCustomer.createComCustomer(payload.comCustomer).pipe(
					tap(res => {
						this.store.dispatch(new ComCustomerCreated({ comCustomer: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private comCustomer: ComCustomerService, private store: Store<AppState>) { }
}
