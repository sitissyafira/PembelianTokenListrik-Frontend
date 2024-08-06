import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { QuotationService } from './quotation.service';
import { AppState } from '../../../core/reducers';
import {
	QuotationActionTypes,
	QuotationPageRequested,
	QuotationPageLoaded,
	QuotationCreated,
	QuotationDeleted,
	QuotationUpdated,
	QuotationOnServerCreated,
	QuotationActionToggleLoading,
	QuotationPageToggleLoading
} from './quotation.action';
import { QueryQuotationModel } from './queryquotation.model';


@Injectable()
export class QuotationEffect {
	showPageLoadingDistpatcher = new QuotationPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new QuotationPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new QuotationActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new QuotationActionToggleLoading({ isLoading: false });

	@Effect()
	loadQuotationPage$ = this.actions$
		.pipe(
			ofType<QuotationPageRequested>(QuotationActionTypes.QuotationPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.quotation.getListQuotation(payload.page)
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
				const lastQuery: QueryQuotationModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new QuotationPageLoaded({
					quotation: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new QuotationPageLoaded({
						quotation: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteQuotation$ = this.actions$
		.pipe(
			ofType<QuotationDeleted>(QuotationActionTypes.QuotationDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.quotation.deleteQuotation(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateQuotation = this.actions$
		.pipe(
			ofType<QuotationUpdated>(QuotationActionTypes.QuotationUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.quotation.updateQuotation(payload.quotation);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<QuotationOnServerCreated>(QuotationActionTypes.QuotationOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.quotation.createQuotation(payload.quotation).pipe(
					tap(res => {
						this.store.dispatch(new QuotationCreated({ quotation: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private quotation: QuotationService, private store: Store<AppState>) { }
}
