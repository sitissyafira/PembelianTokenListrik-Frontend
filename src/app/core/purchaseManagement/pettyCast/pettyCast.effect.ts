import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { PettyCastService } from './pettyCast.service';
import { AppState } from '../../../core/reducers';
import {
	PettyCastActionTypes,
	PettyCastPageRequested,
	PettyCastPageLoaded,
	PettyCastCreated,
	PettyCastDeleted,
	PettyCastUpdated,
	PettyCastOnServerCreated,
	PettyCastActionToggleLoading,
	PettyCastPageToggleLoading
} from './pettyCast.action';
import { QueryPettyCastModel } from './querypettyCast.model';


@Injectable()
export class PettyCastEffect {
	showPageLoadingDistpatcher = new PettyCastPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PettyCastPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PettyCastActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PettyCastActionToggleLoading({ isLoading: false });

	@Effect()
	loadPettyCastPage$ = this.actions$
		.pipe(
			ofType<PettyCastPageRequested>(PettyCastActionTypes.PettyCastPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.pettyCast.getListPettyCast(payload.page)
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
				const lastQuery: QueryPettyCastModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new PettyCastPageLoaded({
					pettyCast: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new PettyCastPageLoaded({
						pettyCast: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deletePettyCast$ = this.actions$
		.pipe(
			ofType<PettyCastDeleted>(PettyCastActionTypes.PettyCastDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.pettyCast.deletePettyCast(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePettyCast = this.actions$
		.pipe(
			ofType<PettyCastUpdated>(PettyCastActionTypes.PettyCastUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.pettyCast.updatePettyCast(payload.pettyCast);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PettyCastOnServerCreated>(PettyCastActionTypes.PettyCastOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.pettyCast.createPettyCast(payload.pettyCast).pipe(
					tap(res => {
						this.store.dispatch(new PettyCastCreated({ pettyCast: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private pettyCast: PettyCastService, private store: Store<AppState>) { }
}
