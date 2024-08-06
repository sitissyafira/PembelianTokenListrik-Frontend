import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { TaxService } from './tax.service';
import { AppState } from '../../../core/reducers';
import {
	TaxActionTypes,
	TaxPageRequested,
	TaxPageLoaded,
	TaxCreated,
	TaxDeleted,
	TaxUpdated,
	TaxOnServerCreated,
	TaxActionToggleLoading,
	TaxPageToggleLoading
} from './tax.action';
import { QueryTaxModel } from './querytax.model';


@Injectable()
export class TaxEffect {
	showPageLoadingDistpatcher = new TaxPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new TaxPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new TaxActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new TaxActionToggleLoading({ isLoading: false });

	@Effect()
	loadTaxPage$ = this.actions$
		.pipe(
			ofType<TaxPageRequested>(TaxActionTypes.TaxPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.tax.getListTax(payload.page)
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
				const lastQuery: QueryTaxModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new TaxPageLoaded({
					tax: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new TaxPageLoaded({
						tax: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteTax$ = this.actions$
		.pipe(
			ofType<TaxDeleted>(TaxActionTypes.TaxDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.tax.deleteTax(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateTax = this.actions$
		.pipe(
			ofType<TaxUpdated>(TaxActionTypes.TaxUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.tax.updateTax(payload.tax);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<TaxOnServerCreated>(TaxActionTypes.TaxOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.tax.createTax(payload.tax).pipe(
					tap(res => {
						this.store.dispatch(new TaxCreated({ tax: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private tax: TaxService, private store: Store<AppState>) { }
}
