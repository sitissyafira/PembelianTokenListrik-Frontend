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
import { PinjamPakaiService } from './pinjamPakai.service';
// State
import { AppState } from '../../../core/reducers';
import {
	PinjamPakaiActionTypes,
	PinjamPakaiPageRequested,
	PinjamPakaiPageLoaded,
	PinjamPakaiCreated,
	PinjamPakaiDeleted,
	PinjamPakaiUpdated,
	PinjamPakaiOnServerCreated,
	PinjamPakaiActionToggleLoading,
	PinjamPakaiPageToggleLoading
} from './pinjamPakai.action';
import { QueryPinjamPakaiModel } from './querypinjamPakai.model';


@Injectable()
export class PinjamPakaiEffect {
	showPageLoadingDistpatcher = new PinjamPakaiPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PinjamPakaiPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PinjamPakaiActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PinjamPakaiActionToggleLoading({ isLoading: false });

	@Effect()
	loadPinjamPakaiPage$ = this.actions$
		.pipe(
			ofType<PinjamPakaiPageRequested>(PinjamPakaiActionTypes.PinjamPakaiPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.pinjamPakai.getListPinjamPakai(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryPinjamPakaiModel = response[1];
				return new PinjamPakaiPageLoaded({
					pinjamPakai: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deletePinjamPakai$ = this.actions$
		.pipe(
			ofType<PinjamPakaiDeleted>(PinjamPakaiActionTypes.PinjamPakaiDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.pinjamPakai.deletePinjamPakai(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePinjamPakai = this.actions$
		.pipe(
			ofType<PinjamPakaiUpdated>(PinjamPakaiActionTypes.PinjamPakaiUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.pinjamPakai.updatePinjamPakai(payload.pinjamPakai);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PinjamPakaiOnServerCreated>(PinjamPakaiActionTypes.PinjamPakaiOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.pinjamPakai.createPinjamPakai(payload.pinjamPakai).pipe(
					tap(res => {
						this.store.dispatch(new PinjamPakaiCreated({ pinjamPakai: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private pinjamPakai: PinjamPakaiService, private store: Store<AppState>) { }
}
