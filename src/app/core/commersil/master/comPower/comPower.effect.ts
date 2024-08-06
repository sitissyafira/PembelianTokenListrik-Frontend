import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../../_base/crud';
import { ComPowerService } from './comPower.service';
import { AppState } from '../../../../core/reducers';
import {
	ComPowerActionTypes,
	ComPowerPageRequested,
	ComPowerPageLoaded,
	ComPowerCreated,
	ComPowerDeleted,
	ComPowerUpdated,
	ComPowerOnServerCreated,
	ComPowerActionToggleLoading,
	ComPowerPageToggleLoading
} from './comPower.action';
import { QueryComPowerModel } from './querycomPower.model';


@Injectable()
export class ComPowerEffect {
	showPageLoadingDistpatcher = new ComPowerPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ComPowerPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ComPowerActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ComPowerActionToggleLoading({ isLoading: false });

	@Effect()
	loadComPowerPage$ = this.actions$
		.pipe(
			ofType<ComPowerPageRequested>(ComPowerActionTypes.ComPowerPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.comPower.getListComPower(payload.page)
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
				const lastQuery: QueryComPowerModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new ComPowerPageLoaded({
					comPower: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new ComPowerPageLoaded({
						comPower: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteComPower$ = this.actions$
		.pipe(
			ofType<ComPowerDeleted>(ComPowerActionTypes.ComPowerDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.comPower.deleteComPower(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateComPower = this.actions$
		.pipe(
			ofType<ComPowerUpdated>(ComPowerActionTypes.ComPowerUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.comPower.updateComPower(payload.comPower);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<ComPowerOnServerCreated>(ComPowerActionTypes.ComPowerOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.comPower.createComPower(payload.comPower).pipe(
					tap(res => {
						this.store.dispatch(new ComPowerCreated({ comPower: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private comPower: ComPowerService, private store: Store<AppState>) { }
}
