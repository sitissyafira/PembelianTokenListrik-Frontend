import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../../_base/crud';
import { ComTypeService } from './comType.service';
import { AppState } from '../../../../core/reducers';
import {
	ComTypeActionTypes,
	ComTypePageRequested,
	ComTypePageLoaded,
	ComTypeCreated,
	ComTypeDeleted,
	ComTypeUpdated,
	ComTypeOnServerCreated,
	ComTypeActionToggleLoading,
	ComTypePageToggleLoading
} from './comType.action';
import { QueryComTypeModel } from './querycomType.model';


@Injectable()
export class ComTypeEffect {
	showPageLoadingDistpatcher = new ComTypePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ComTypePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ComTypeActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ComTypeActionToggleLoading({ isLoading: false });

	@Effect()
	loadComTypePage$ = this.actions$
		.pipe(
			ofType<ComTypePageRequested>(ComTypeActionTypes.ComTypePageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.comType.getListComType(payload.page)
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
				const lastQuery: QueryComTypeModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new ComTypePageLoaded({
					comType: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new ComTypePageLoaded({
						comType: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteComType$ = this.actions$
		.pipe(
			ofType<ComTypeDeleted>(ComTypeActionTypes.ComTypeDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.comType.deleteComType(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateComType = this.actions$
		.pipe(
			ofType<ComTypeUpdated>(ComTypeActionTypes.ComTypeUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.comType.updateComType(payload.comType);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<ComTypeOnServerCreated>(ComTypeActionTypes.ComTypeOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.comType.createComType(payload.comType).pipe(
					tap(res => {
						this.store.dispatch(new ComTypeCreated({ comType: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private comType: ComTypeService, private store: Store<AppState>) { }
}
