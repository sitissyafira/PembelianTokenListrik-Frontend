import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { CurrencyService } from './currency.service';
import { AppState } from '../../../core/reducers';
import {
	CurrencyActionTypes,
	CurrencyPageRequested,
	CurrencyPageLoaded,
	CurrencyCreated,
	CurrencyDeleted,
	CurrencyUpdated,
	CurrencyOnServerCreated,
	CurrencyActionToggleLoading,
	CurrencyPageToggleLoading
} from './currency.action';
import { QueryCurrencyModel } from './querycurrency.model';


@Injectable()
export class CurrencyEffect {
	showPageLoadingDistpatcher = new CurrencyPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new CurrencyPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new CurrencyActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new CurrencyActionToggleLoading({ isLoading: false });

	@Effect()
	loadCurrencyPage$ = this.actions$
		.pipe(
			ofType<CurrencyPageRequested>(CurrencyActionTypes.CurrencyPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.currency.getListCurrency(payload.page)
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
				const lastQuery: QueryCurrencyModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new CurrencyPageLoaded({
					currency: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new CurrencyPageLoaded({
						currency: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteCurrency$ = this.actions$
		.pipe(
			ofType<CurrencyDeleted>(CurrencyActionTypes.CurrencyDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.currency.deleteCurrency(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateCurrency = this.actions$
		.pipe(
			ofType<CurrencyUpdated>(CurrencyActionTypes.CurrencyUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.currency.updateCurrency(payload.currency);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<CurrencyOnServerCreated>(CurrencyActionTypes.CurrencyOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.currency.createCurrency(payload.currency).pipe(
					tap(res => {
						this.store.dispatch(new CurrencyCreated({ currency: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private currency: CurrencyService, private store: Store<AppState>) { }
}
