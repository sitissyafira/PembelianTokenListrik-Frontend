// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { GalonRateService } from './rate.service';
// State
import { AppState } from '../../../core/reducers';
import {
	GalonRateActionTypes,
	GalonRatePageRequested,
	GalonRatePageLoaded,
	GalonRateCreated,
	GalonRateDeleted,
	GalonRateUpdated,
	GalonRateOnServerCreated,
	GalonRateActionToggleLoading,
	GalonRatePageToggleLoading
} from './rate.action';
import { QueryGalonRateModel } from './queryrate.model';

@Injectable()
export class GalonRateEffect {
	showPageLoadingDistpatcher = new GalonRatePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new GalonRatePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new GalonRateActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new GalonRateActionToggleLoading({ isLoading: false });

	@Effect()
	loadGalonRatePage$ = this.actions$
		.pipe(
			ofType<GalonRatePageRequested>(GalonRateActionTypes.GalonRatePageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.galonrate.getListGalonRate(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: '', data: [] };
				const lastQuery: QueryGalonRateModel = response[1];
				return new GalonRatePageLoaded({
					galonrate: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteGalonRate$ = this.actions$
		.pipe(
			ofType<GalonRateDeleted>(GalonRateActionTypes.GalonRateDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.galonrate.deleteGalonRate(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateGalonRate = this.actions$
		.pipe(
			ofType<GalonRateUpdated>(GalonRateActionTypes.GalonRateUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.galonrate.updateGalonRate(payload.galonrate);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<GalonRateOnServerCreated>(GalonRateActionTypes.GalonRateOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.galonrate.createGalonRate(payload.galonrate).pipe(
					tap(res => {
						this.store.dispatch(new GalonRateCreated({ galonrate: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private galonrate: GalonRateService, private store: Store<AppState>) { }
}
