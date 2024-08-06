import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../../_base/crud';
import { ComTPowerService } from './comTPower.service';
import { AppState } from '../../../../core/reducers';
import {
	ComTPowerActionTypes,
	ComTPowerPageRequested,
	ComTPowerPageLoaded,
	ComTPowerCreated,
	ComTPowerDeleted,
	ComTPowerUpdated,
	ComTPowerOnServerCreated,
	ComTPowerActionToggleLoading,
	ComTPowerPageToggleLoading
} from './comTPower.action';
import { QueryComTPowerModel } from './querycomTPower.model';


@Injectable()
export class ComTPowerEffect {
	showPageLoadingDistpatcher = new ComTPowerPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ComTPowerPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ComTPowerActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ComTPowerActionToggleLoading({ isLoading: false });

	@Effect()
	loadComTPowerPage$ = this.actions$
		.pipe(
			ofType<ComTPowerPageRequested>(ComTPowerActionTypes.ComTPowerPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.comTPower.getListComTPower(payload.page)
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
				const lastQuery: QueryComTPowerModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new ComTPowerPageLoaded({
					comTPower: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new ComTPowerPageLoaded({
						comTPower: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteComTPower$ = this.actions$
		.pipe(
			ofType<ComTPowerDeleted>(ComTPowerActionTypes.ComTPowerDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.comTPower.deleteComTPower(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateComTPower = this.actions$
		.pipe(
			ofType<ComTPowerUpdated>(ComTPowerActionTypes.ComTPowerUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.comTPower.updateComTPower(payload.comTPower);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<ComTPowerOnServerCreated>(ComTPowerActionTypes.ComTPowerOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.comTPower.createComTPower(payload.comTPower).pipe(
					tap(res => {
						this.store.dispatch(new ComTPowerCreated({ comTPower: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private comTPower: ComTPowerService, private store: Store<AppState>) { }
}
