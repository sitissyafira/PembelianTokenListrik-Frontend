// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../_base/crud';
// Services
import { RevenueService } from './revenue.service';
// State
import { AppState } from '../../core/reducers';
import {
	RevenueActionTypes,
	RevenuePageRequested,
	RevenuePageLoaded,
	RevenueCreated,
	RevenueDeleted,
	RevenueUpdated,
	RevenueOnServerCreated,
	RevenueActionToggleLoading,
	RevenuePageToggleLoading
} from './revenue.action';
import { QueryRevenueModel } from './queryrevenue.model';


@Injectable()
export class RevenueEffect {
	showPageLoadingDistpatcher = new RevenuePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new RevenuePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new RevenueActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new RevenueActionToggleLoading({ isLoading: false });

	@Effect()
	loadRevenuePage$ = this.actions$
		.pipe(
			ofType<RevenuePageRequested>(RevenueActionTypes.RevenuePageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.revenue.getListRevenue(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryRevenueModel = response[1];
				return new RevenuePageLoaded({
					revenue: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteRevenue$ = this.actions$
		.pipe(
			ofType<RevenueDeleted>(RevenueActionTypes.RevenueDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.revenue.deleteRevenue(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateRevenue = this.actions$
		.pipe(
			ofType<RevenueUpdated>(RevenueActionTypes.RevenueUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.revenue.updateRevenue(payload.revenue);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<RevenueOnServerCreated>(RevenueActionTypes.RevenueOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.revenue.createRevenue(payload.revenue).pipe(
					tap(res => {
						this.store.dispatch(new RevenueCreated({ revenue: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private revenue: RevenueService, private store: Store<AppState>) { }
}
