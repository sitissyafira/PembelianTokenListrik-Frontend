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
import { BudgetingService } from './budgeting.service';
// State
import { AppState } from '../../../core/reducers';
import {
	BudgetingActionTypes,
	BudgetingPageRequested,
	BudgetingPageLoaded,
	BudgetingCreated,
	BudgetingDeleted,
	BudgetingUpdated,
	BudgetingOnServerCreated,
	BudgetingActionToggleLoading,
	BudgetingPageToggleLoading,
} from './budgeting.action';
import { QueryBudgetingModel } from './querybudgeting.model';


@Injectable()
export class BudgetingEffect {
	showPageLoadingDistpatcher = new BudgetingPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new BudgetingPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new BudgetingActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new BudgetingActionToggleLoading({ isLoading: false });

	@Effect()
	loadBudgetingPage$ = this.actions$
		.pipe(
			ofType<BudgetingPageRequested>(BudgetingActionTypes.BudgetingPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.budgeting.getListBudgeting(payload.page)
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
				const lastQuery: QueryBudgetingModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new BudgetingPageLoaded({
					budgeting: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new BudgetingPageLoaded({
						budgeting: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteBudgeting$ = this.actions$
		.pipe(
			ofType<BudgetingDeleted>(BudgetingActionTypes.BudgetingDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.budgeting.deleteBudgeting(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateBudgeting = this.actions$
		.pipe(
			ofType<BudgetingUpdated>(BudgetingActionTypes.BudgetingUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.budgeting.updateBudgeting(payload.budgeting);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);
	@Effect()
	createBudgeting$ = this.actions$
		.pipe(
			ofType<BudgetingOnServerCreated>(BudgetingActionTypes.BudgetingOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.budgeting.createBudgeting(payload.budgeting).pipe(
					tap(res => {
						this.store.dispatch(new BudgetingCreated({ budgeting: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private budgeting: BudgetingService, private store: Store<AppState>) { }
}
