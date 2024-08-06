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
import { RatePinaltyService } from './ratePinalty.service';
// State
import { AppState } from '../../core/reducers';
import {
	RatePinaltyActionTypes,
	RatePinaltyPageRequested,
	RatePinaltyPageLoaded,
	RatePinaltyCreated,
	RatePinaltyDeleted,
	RatePinaltyUpdated,
	RatePinaltyOnServerCreated,
	RatePinaltyActionToggleLoading,
	RatePinaltyPageToggleLoading
} from './ratePinalty.action';
import { QueryPinaltyModel } from './querypinalty.model';


@Injectable()
export class RatePinaltyEffect {
	showPageLoadingDistpatcher = new RatePinaltyPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new RatePinaltyPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new RatePinaltyActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new RatePinaltyActionToggleLoading({ isLoading: false });

	@Effect()
	loadRatePinaltyPage$ = this.actions$
		.pipe(
			ofType<RatePinaltyPageRequested>(RatePinaltyActionTypes.RatePinaltyPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ratePinalty.getListRatePinalty(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryPinaltyModel = response[1];
				return new RatePinaltyPageLoaded({
					ratePinalty: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteRatePinalty$ = this.actions$
		.pipe(
			ofType<RatePinaltyDeleted>(RatePinaltyActionTypes.RatePinaltyDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.ratePinalty.deleteRatePinalty(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateRatePinalty = this.actions$
		.pipe(
			ofType<RatePinaltyUpdated>(RatePinaltyActionTypes.RatePinaltyUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.ratePinalty.updateRatePinalty(payload.ratePinalty);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<RatePinaltyOnServerCreated>(RatePinaltyActionTypes.RatePinaltyOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.ratePinalty.createRatePinalty(payload.ratePinalty).pipe(
					tap(res => {
						this.store.dispatch(new RatePinaltyCreated({ ratePinalty: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private ratePinalty: RatePinaltyService, private store: Store<AppState>) { }
}
