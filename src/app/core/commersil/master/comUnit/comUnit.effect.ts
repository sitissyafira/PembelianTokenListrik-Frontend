import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../../_base/crud';
import { ComUnitService } from './comUnit.service';
import { AppState } from '../../../../core/reducers';
import {
	ComUnitActionTypes,
	ComUnitPageRequested,
	ComUnitPageLoaded,
	ComUnitCreated,
	ComUnitDeleted,
	ComUnitUpdated,
	ComUnitOnServerCreated,
	ComUnitActionToggleLoading,
	ComUnitPageToggleLoading
} from './comUnit.action';
import { QueryComUnitModel } from './querycomUnit.model';


@Injectable()
export class ComUnitEffect {
	showPageLoadingDistpatcher = new ComUnitPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ComUnitPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ComUnitActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ComUnitActionToggleLoading({ isLoading: false });

	@Effect()
	loadComUnitPage$ = this.actions$
		.pipe(
			ofType<ComUnitPageRequested>(ComUnitActionTypes.ComUnitPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.comUnit.getListComUnit(payload.page)
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
				const lastQuery: QueryComUnitModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new ComUnitPageLoaded({
					comUnit: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new ComUnitPageLoaded({
						comUnit: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteComUnit$ = this.actions$
		.pipe(
			ofType<ComUnitDeleted>(ComUnitActionTypes.ComUnitDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.comUnit.deleteComUnit(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateComUnit = this.actions$
		.pipe(
			ofType<ComUnitUpdated>(ComUnitActionTypes.ComUnitUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.comUnit.updateComUnit(payload.comUnit);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<ComUnitOnServerCreated>(ComUnitActionTypes.ComUnitOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.comUnit.createComUnit(payload.comUnit).pipe(
					tap(res => {
						this.store.dispatch(new ComUnitCreated({ comUnit: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private comUnit: ComUnitService, private store: Store<AppState>) { }
}
