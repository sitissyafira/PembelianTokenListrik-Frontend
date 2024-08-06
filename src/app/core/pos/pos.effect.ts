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
import { PosService } from './pos.service';
// State
import { AppState } from '../reducers';
import {
	PosActionTypes,
	PosPageRequested,
	PosPageLoaded,
	PosCreated,
	PosDeleted,
	PosUpdated,
	PosOnServerCreated,
	PosActionToggleLoading,
	PosPageToggleLoading
} from './pos.action';
import { QueryPosModel } from './querypos.model';


@Injectable()
export class PosEffect {
	showPageLoadingDistpatcher = new PosPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PosPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PosActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PosActionToggleLoading({ isLoading: false });

	// @Effect()
	// loadPosPage$ = this.actions$
	// 	.pipe(
	// 		ofType<PosPageRequested>(PosActionTypes.PosPageRequested),
	// 		mergeMap(({ payload }) => {
	// 			this.store.dispatch(this.showPageLoadingDistpatcher);
	// 			const requestToServer = this.pos.getListPos(payload.page);
	// 			const lastQuery = of(payload.page);
	// 			return forkJoin(requestToServer, lastQuery);
	// 		}),
	// 		map(response => {
	// 			let res: { errorMessage: string; totalCount: any; items: any };
	// 			const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
	// 			const lastQuery: QueryPosModel = response[1];
	// 			return new PosPageLoaded({
	// 				pos: result.items,
	// 				totalCount: result.totalCount,
	// 				page: lastQuery
	// 			});
	// 		}),
	// 	);

	// @Effect()
	// deletePos$ = this.actions$
	// 	.pipe(
	// 		ofType<PosDeleted>(PosActionTypes.PosDeleted),
	// 		mergeMap(({ payload }) => {
	// 			this.store.dispatch(this.showActionLoadingDistpatcher);
	// 			return this.pos.deletePos(payload.id);
	// 		}
	// 		),
	// 		map(() => {
	// 			return this.hideActionLoadingDistpatcher;
	// 		}),
	// 	);

	// @Effect()
	// updatePos = this.actions$
	// 	.pipe(
	// 		ofType<PosUpdated>(PosActionTypes.PosUpdated),
	// 		mergeMap(({ payload }) => {
	// 			this.store.dispatch(this.showActionLoadingDistpatcher);
	// 			return this.pos.updatePos(payload.pos);
	// 		}),
	// 		map(() => {
	// 			return this.hideActionLoadingDistpatcher;
	// 		}),
	// 	);

	// @Effect()
	// createBlock$ = this.actions$
	// 	.pipe(
	// 		ofType<PosOnServerCreated>(PosActionTypes.PosOnServerCreated),
	// 		mergeMap(({ payload }) => {
	// 			this.store.dispatch(this.showActionLoadingDistpatcher);
	// 			return this.pos.createPos(payload.pos).pipe(
	// 				tap(res => {
	// 					this.store.dispatch(new PosCreated({ pos: res }));
	// 				})
	// 			);
	// 		}),
	// 		map(() => {
	// 			return this.hideActionLoadingDistpatcher;
	// 		}),
	// 	);

	constructor(private actions$: Actions, private pos: PosService, private store: Store<AppState>) { }
}
