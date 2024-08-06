// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { Observable, defer, of, forkJoin, throwError } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { VisitorService } from './visitor.service';
// State
import { AppState } from '../../../core/reducers';
import {
	VisitorActionTypes,
	VisitorPageRequested,
	VisitorPageLoaded,
	VisitorCreated,
	VisitorDeleted,
	VisitorUpdated,
	VisitorOnServerCreated,
	VisitorActionToggleLoading,
	VisitorPageToggleLoading
} from './visitor.action';
import { QueryVisitorModel } from './queryvisitor.model';


@Injectable()
export class VisitorEffect {
	showPageLoadingDistpatcher = new VisitorPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new VisitorPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new VisitorActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new VisitorActionToggleLoading({ isLoading: false });

	@Effect()
	loadVisitorPage$ = this.actions$
		.pipe(
			ofType<VisitorPageRequested>(VisitorActionTypes.VisitorPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.visitor.getListVisitor(payload.page)
					.pipe(
						catchError(err => {
							return throwError(err);
						}),
						catchError(err => {
							return of(err)
						})
					);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map((response: any) => {
				const lastQuery: QueryVisitorModel = response[1];

				if (response[0].status && response[0].status === 200) {
					const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
					return new VisitorPageLoaded({
						visitor: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				} else {
					const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new VisitorPageLoaded({
						visitor: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteVisitor$ = this.actions$
		.pipe(
			ofType<VisitorDeleted>(VisitorActionTypes.VisitorDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.visitor.deleteVisitor(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateVisitor = this.actions$
		.pipe(
			ofType<VisitorUpdated>(VisitorActionTypes.VisitorUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.visitor.updateVisitor(payload.visitor, "id");
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<VisitorOnServerCreated>(VisitorActionTypes.VisitorOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.visitor.createVisitor(payload.visitor).pipe(
					tap(res => {
						this.store.dispatch(new VisitorCreated({ visitor: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private visitor: VisitorService, private store: Store<AppState>) { }
}
