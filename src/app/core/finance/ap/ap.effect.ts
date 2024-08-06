import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { ApService } from './ap.service';
import { AppState } from '../../../core/reducers';
import {
	ApActionTypes,
	ApPageRequested,
	ApPageLoaded,
	ApCreated,
	ApDeleted,
	ApUpdated,
	ApOnServerCreated,
	ApActionToggleLoading,
	ApPageToggleLoading
} from './ap.action';
import { QueryApModel } from './queryap.model';


@Injectable()
export class ApEffect {
	showPageLoadingDistpatcher = new ApPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ApPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ApActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ApActionToggleLoading({ isLoading: false });

	@Effect()
	loadApPage$ = this.actions$
		.pipe(
			ofType<ApPageRequested>(ApActionTypes.ApPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ap.getListAp(payload.page)
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
				const lastQuery: QueryApModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new ApPageLoaded({
					ap: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new ApPageLoaded({
						ap: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteAp$ = this.actions$
		.pipe(
			ofType<ApDeleted>(ApActionTypes.ApDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.ap.deleteAp(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateAp = this.actions$
		.pipe(
			ofType<ApUpdated>(ApActionTypes.ApUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.ap.updateAp(payload.ap);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<ApOnServerCreated>(ApActionTypes.ApOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.ap.createAp(payload.ap).pipe(
					tap(res => {
						this.store.dispatch(new ApCreated({ ap: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private ap: ApService, private store: Store<AppState>) { }
}
