// Anguladjustment
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
import { AdjustmentService } from './adjustment.service';
// State
import { AppState } from '../../../reducers';
import {
	AdjustmentActionTypes,
	AdjustmentPageRequested,
	AdjustmentPageLoaded,
	AdjustmentCreated,
	AdjustmentDeleted,
	AdjustmentUpdated,
	AdjustmentOnServerCreated,
	AdjustmentActionToggleLoading,
	AdjustmentPageToggleLoading
} from './adjustment.action';
import { QueryAdjustmentModel } from './queryadjustment.model';


@Injectable()
export class AdjustmentEffect {
	showPageLoadingDistpatcher = new AdjustmentPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new AdjustmentPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new AdjustmentActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new AdjustmentActionToggleLoading({ isLoading: false });

	@Effect()
	loadAdjustmentPage$ = this.actions$
		.pipe(
			ofType<AdjustmentPageRequested>(AdjustmentActionTypes.AdjustmentPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.adjustment.getListAdjustment(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryAdjustmentModel = response[1];
				return new AdjustmentPageLoaded({
					adjustment: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);
	@Effect()
	deleteAdjustment$ = this.actions$
		.pipe(
			ofType<AdjustmentDeleted>(AdjustmentActionTypes.AdjustmentDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.adjustment.deleteAdjustment(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateAdjustment = this.actions$
		.pipe(
			ofType<AdjustmentUpdated>(AdjustmentActionTypes.AdjustmentUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.adjustment.updateAdjustment(payload.adjustment);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<AdjustmentOnServerCreated>(AdjustmentActionTypes.AdjustmentOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.adjustment.createAdjustment(payload.adjustment).pipe(
					tap(res => {
						this.store.dispatch(new AdjustmentCreated({ adjustment: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private adjustment: AdjustmentService, private store: Store<AppState>) { }
}
