import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../../_base/crud';
import { ComWaterService } from './comWater.service';
import { AppState } from '../../../../core/reducers';
import {
	ComWaterActionTypes,
	ComWaterPageRequested,
	ComWaterPageLoaded,
	ComWaterCreated,
	ComWaterDeleted,
	ComWaterUpdated,
	ComWaterOnServerCreated,
	ComWaterActionToggleLoading,
	ComWaterPageToggleLoading
} from './comWater.action';
import { QueryComWaterModel } from './querycomWater.model';


@Injectable()
export class ComWaterEffect {
	showPageLoadingDistpatcher = new ComWaterPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ComWaterPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ComWaterActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ComWaterActionToggleLoading({ isLoading: false });

	@Effect()
	loadComWaterPage$ = this.actions$
		.pipe(
			ofType<ComWaterPageRequested>(ComWaterActionTypes.ComWaterPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.comWater.getListComWater(payload.page)
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
				const lastQuery: QueryComWaterModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new ComWaterPageLoaded({
					comWater: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new ComWaterPageLoaded({
						comWater: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteComWater$ = this.actions$
		.pipe(
			ofType<ComWaterDeleted>(ComWaterActionTypes.ComWaterDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.comWater.deleteComWater(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateComWater = this.actions$
		.pipe(
			ofType<ComWaterUpdated>(ComWaterActionTypes.ComWaterUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.comWater.updateComWater(payload.comWater);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<ComWaterOnServerCreated>(ComWaterActionTypes.ComWaterOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.comWater.createComWater(payload.comWater).pipe(
					tap(res => {
						this.store.dispatch(new ComWaterCreated({ comWater: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private comWater: ComWaterService, private store: Store<AppState>) { }
}
