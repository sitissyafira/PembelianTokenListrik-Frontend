// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../_base/crud';
// Services
import { ArCardService } from './arCard.service';
// State
import { AppState } from '../../core/reducers';
import {
	ArCardActionTypes,
	ArCardPageRequested,
	ArCardPageLoaded,
	ArCardCreated,
	ArCardDeleted,
	ArCardUpdated,
	ArCardOnServerCreated,
	ArCardActionToggleLoading,
	ArCardPageToggleLoading
} from './arCard.action';
import { QueryArCardModel } from './queryarCard.model';

@Injectable()
export class ArCardEffect {
	showPageLoadingDistpatcher = new ArCardPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ArCardPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ArCardActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ArCardActionToggleLoading({ isLoading: false });

	@Effect()
	loadArCardPage$ = this.actions$
		.pipe(
			ofType<ArCardPageRequested>(ArCardActionTypes.ArCardPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.arCard.getListArCard(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryArCardModel = response[1];
				return new ArCardPageLoaded({
					arCard: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteArCard$ = this.actions$
		.pipe(
			ofType<ArCardDeleted>(ArCardActionTypes.ArCardDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.arCard.deleteArCard(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateArCard$ = this.actions$
		.pipe(
			ofType<ArCardUpdated>(ArCardActionTypes.ArCardUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.arCard.updateArCard(payload.arCard);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createArCard$ = this.actions$
		.pipe(
			ofType<ArCardOnServerCreated>(ArCardActionTypes.ArCardOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.arCard.createArCard(payload.arCard).pipe(
					tap(res => {
						this.store.dispatch(new ArCardCreated({ arCard: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private arCard: ArCardService, private store: Store<AppState>) { }
}
