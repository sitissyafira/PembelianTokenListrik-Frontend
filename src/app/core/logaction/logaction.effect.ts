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
import { LogactionService } from './logaction.service';
// State
import { AppState } from '../../core/reducers';
import {
	LogactionActionTypes,
	LogactionPageRequested,
	LogactionPageLoaded,
	LogactionCreated,
	LogactionDeleted,
	LogactionUpdated,
	LogactionOnServerCreated,
	LogactionActionToggleLoading,
	LogactionPageToggleLoading
} from './logaction.action';
import { QueryLogactionModel } from './querylogaction.model';


@Injectable()
export class LogactionEffect {
	showPageLoadingDistpatcher = new LogactionPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new LogactionPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new LogactionActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new LogactionActionToggleLoading({ isLoading: false });

	@Effect()
	loadLogactionPage$ = this.actions$
		.pipe(
			ofType<LogactionPageRequested>(LogactionActionTypes.LogactionPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.logaction.getListLogaction(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryLogactionModel = response[1];
				return new LogactionPageLoaded({
					logaction: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteLogaction$ = this.actions$
		.pipe(
			ofType<LogactionDeleted>(LogactionActionTypes.LogactionDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.logaction.deleteLogaction(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateLogaction = this.actions$
		.pipe(
			ofType<LogactionUpdated>(LogactionActionTypes.LogactionUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.logaction.updateLogaction(payload.logaction);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<LogactionOnServerCreated>(LogactionActionTypes.LogactionOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.logaction.createLogaction(payload.logaction).pipe(
					tap(res => {
						this.store.dispatch(new LogactionCreated({ logaction: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private logaction: LogactionService, private store: Store<AppState>) { }
}
