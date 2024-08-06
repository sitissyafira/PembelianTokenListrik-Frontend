import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../../_base/crud';
import { ComTWaterService } from './comTWater.service';
import { AppState } from '../../../../core/reducers';
import {
	ComTWaterActionTypes,
	ComTWaterPageRequested,
	ComTWaterPageLoaded,
	ComTWaterCreated,
	ComTWaterDeleted,
	ComTWaterUpdated,
	ComTWaterOnServerCreated,
	ComTWaterActionToggleLoading,
	ComTWaterPageToggleLoading
} from './comTWater.action';
import { QueryComTWaterModel } from './querycomTWater.model';


@Injectable()
export class ComTWaterEffect {
	showPageLoadingDistpatcher = new ComTWaterPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ComTWaterPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ComTWaterActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ComTWaterActionToggleLoading({ isLoading: false });

	@Effect()
	loadComTWaterPage$ = this.actions$
		.pipe(
			ofType<ComTWaterPageRequested>(ComTWaterActionTypes.ComTWaterPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.comTWater.getListComTWater(payload.page)
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
				const lastQuery: QueryComTWaterModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new ComTWaterPageLoaded({
					comTWater: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new ComTWaterPageLoaded({
						comTWater: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteComTWater$ = this.actions$
		.pipe(
			ofType<ComTWaterDeleted>(ComTWaterActionTypes.ComTWaterDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.comTWater.deleteComTWater(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateComTWater = this.actions$
		.pipe(
			ofType<ComTWaterUpdated>(ComTWaterActionTypes.ComTWaterUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.comTWater.updateComTWater(payload.comTWater);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<ComTWaterOnServerCreated>(ComTWaterActionTypes.ComTWaterOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.comTWater.createComTWater(payload.comTWater).pipe(
					tap(res => {
						this.store.dispatch(new ComTWaterCreated({ comTWater: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private comTWater: ComTWaterService, private store: Store<AppState>) { }
}
