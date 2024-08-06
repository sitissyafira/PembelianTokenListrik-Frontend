import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { TabulationService } from './tabulation.service';
import { AppState } from '../../reducers';
import {
	TabulationActionTypes,
	TabulationPageRequested,
	TabulationPageLoaded,
	TabulationCreated,
	TabulationDeleted,
	TabulationUpdated,
	TabulationOnServerCreated,
	TabulationActionToggleLoading,
	TabulationPageToggleLoading
} from './tabulation.action';
import { QueryTabulationModel } from './querytabulation.model';


@Injectable()
export class TabulationEffect {
	showPageLoadingDistpatcher = new TabulationPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new TabulationPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new TabulationActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new TabulationActionToggleLoading({ isLoading: false });

	@Effect()
	loadTabulationPage$ = this.actions$
		.pipe(
			ofType<TabulationPageRequested>(TabulationActionTypes.TabulationPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.tabulation.getListTabulation(payload.page)
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
				const lastQuery: QueryTabulationModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new TabulationPageLoaded({
					tabulation: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new TabulationPageLoaded({
						tabulation: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteTabulation$ = this.actions$
		.pipe(
			ofType<TabulationDeleted>(TabulationActionTypes.TabulationDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.tabulation.deleteTabulation(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateTabulation = this.actions$
		.pipe(
			ofType<TabulationUpdated>(TabulationActionTypes.TabulationUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.tabulation.updateTabulation(payload.tabulation);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<TabulationOnServerCreated>(TabulationActionTypes.TabulationOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.tabulation.createTabulation(payload.tabulation).pipe(
					tap(res => {
						this.store.dispatch(new TabulationCreated({ tabulation: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private tabulation: TabulationService, private store: Store<AppState>) { }
}
