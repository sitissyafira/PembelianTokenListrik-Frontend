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
import { PatroliService } from './patroli.service';
// State
import { AppState } from '../reducers';
import {
	PatroliActionTypes,
	PatroliPageRequested,
	PatroliPageLoaded,
	PatroliCreated,
	PatroliDeleted,
	PatroliUpdated,
	PatroliOnServerCreated,
	PatroliActionToggleLoading,
	PatroliPageToggleLoading
} from './patroli.action';
import { QueryPatroliModel } from './querypatroli.model';

@Injectable()
export class PatroliEffect {
	showPageLoadingDistpatcher = new PatroliPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PatroliPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PatroliActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PatroliActionToggleLoading({ isLoading: false });

	@Effect()
	loadPatroliPage$ = this.actions$
		.pipe(
			ofType<PatroliPageRequested>(PatroliActionTypes.PatroliPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.patroli.getListPatroli(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryPatroliModel = response[1];
				return new PatroliPageLoaded({
					patroli: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deletePatroli$ = this.actions$
		.pipe(
			ofType<PatroliDeleted>(PatroliActionTypes.PatroliDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.patroli.deletePatroli(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePatroli = this.actions$
		.pipe(
			ofType<PatroliUpdated>(PatroliActionTypes.PatroliUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.patroli.updatePatroli(payload.patroli);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createPatroli$ = this.actions$
		.pipe(
			ofType<PatroliOnServerCreated>(PatroliActionTypes.PatroliOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.patroli.createPatroli(payload.patroli).pipe(
					tap(res => {
						this.store.dispatch(new PatroliCreated({ patroli: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private patroli: PatroliService, private store: Store<AppState>) { }
}
