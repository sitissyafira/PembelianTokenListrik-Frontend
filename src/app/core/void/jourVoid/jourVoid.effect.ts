// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { JourVoidService } from './jourVoid.service';
// State
import { AppState } from '../../reducers';
import {
	JourVoidActionTypes,
	JourVoidPageRequested,
	JourVoidPageLoaded,
	JourVoidCreated,
	JourVoidDeleted,
	JourVoidUpdated,
	JourVoidOnServerCreated,
	JourVoidActionToggleLoading,
	JourVoidPageToggleLoading
} from './jourVoid.action';
import { QueryJourVoidModel } from './queryjourVoid.model';

@Injectable()
export class JourVoidEffect {
	showPageLoadingDistpatcher = new JourVoidPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new JourVoidPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new JourVoidActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new JourVoidActionToggleLoading({ isLoading: false });

	@Effect()
	loadJourVoidPage$ = this.actions$
		.pipe(
			ofType<JourVoidPageRequested>(JourVoidActionTypes.JourVoidPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.jourVoid.getListJourVoid(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryJourVoidModel = response[1];
				return new JourVoidPageLoaded({
					jourVoid: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteJourVoid$ = this.actions$
		.pipe(
			ofType<JourVoidDeleted>(JourVoidActionTypes.JourVoidDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.jourVoid.deleteJourVoid(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateJourVoid$ = this.actions$
		.pipe(
			ofType<JourVoidUpdated>(JourVoidActionTypes.JourVoidUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.jourVoid.updateJourVoid(payload.jourVoid);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createJourVoid$ = this.actions$
		.pipe(
			ofType<JourVoidOnServerCreated>(JourVoidActionTypes.JourVoidOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.jourVoid.createJourVoid(payload.jourVoid).pipe(
					tap(res => {
						this.store.dispatch(new JourVoidCreated({ jourVoid: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private jourVoid: JourVoidService, private store: Store<AppState>) { }
}
