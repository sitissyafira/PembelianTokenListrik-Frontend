// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../../_base/crud';
// Services
import { FixedService } from './fixed.service';
// State
import { AppState } from '../../../../core/reducers';
import {
	FixedActionTypes,
	FixedPageRequested,
	FixedPageLoaded,
	FixedCreated,
	FixedDeleted,
	FixedUpdated,
	FixedOnServerCreated,
	FixedActionToggleLoading,
	FixedPageToggleLoading
} from './fixed.action';
import { QueryFixedModel } from './queryfixed.model';


@Injectable()
export class FixedEffect {
	showPageLoadingDistpatcher = new FixedPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new FixedPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new FixedActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new FixedActionToggleLoading({ isLoading: false });

	@Effect()
	loadFixedPage$ = this.actions$
		.pipe(
			ofType<FixedPageRequested>(FixedActionTypes.FixedPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.fixed.getListFixed(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryFixedModel = response[1];
				return new FixedPageLoaded({
					fixed: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteFixed$ = this.actions$
		.pipe(
			ofType<FixedDeleted>(FixedActionTypes.FixedDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.fixed.deleteFixed(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateFixed = this.actions$
		.pipe(
			ofType<FixedUpdated>(FixedActionTypes.FixedUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.fixed.updateFixed(payload.fixed);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<FixedOnServerCreated>(FixedActionTypes.FixedOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.fixed.createFixed(payload.fixed).pipe(
					tap(res => {
						this.store.dispatch(new FixedCreated({ fixed: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private fixed: FixedService, private store: Store<AppState>) { }
}
