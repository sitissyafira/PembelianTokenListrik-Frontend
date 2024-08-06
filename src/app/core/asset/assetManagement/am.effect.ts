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
import { AmService } from './am.service';
// State
import { AppState } from '../../../core/reducers';
import {
	AmActionTypes,
	AmPageRequested,
	AmPageLoaded,
	AmCreated,
	AmDeleted,
	AmUpdated,
	AmOnServerCreated,
	AmActionToggleLoading,
	AmPageToggleLoading
} from './am.action';
import { QueryAmModel } from './queryam.model';


@Injectable()
export class AmEffect {
	showPageLoadingDistpatcher = new AmPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new AmPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new AmActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new AmActionToggleLoading({ isLoading: false });

	@Effect()
	loadAmPage$ = this.actions$
		.pipe(
			ofType<AmPageRequested>(AmActionTypes.AmPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.am.getListAm(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryAmModel = response[1];
				return new AmPageLoaded({
					am: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteAm$ = this.actions$
		.pipe(
			ofType<AmDeleted>(AmActionTypes.AmDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.am.deleteAm(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateAm = this.actions$
		.pipe(
			ofType<AmUpdated>(AmActionTypes.AmUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.am.updateAm(payload.am);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<AmOnServerCreated>(AmActionTypes.AmOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.am.createAm(payload.am).pipe(
					tap(res => {
						this.store.dispatch(new AmCreated({ am: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private am: AmService, private store: Store<AppState>) { }
}
