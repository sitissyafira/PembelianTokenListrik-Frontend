// AngulsetOff
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
import { SetOffService } from './setOff.service';
// State
import { AppState } from '../../../reducers';
import {
	SetOffActionTypes,
	SetOffPageRequested,
	SetOffPageLoaded,
	SetOffCreated,
	SetOffDeleted,
	SetOffUpdated,
	SetOffOnServerCreated,
	SetOffActionToggleLoading,
	SetOffPageToggleLoading
} from './setOff.action';
import { QuerySetOffModel } from './querysetOff.model';


@Injectable()
export class SetOffEffect {
	showPageLoadingDistpatcher = new SetOffPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new SetOffPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new SetOffActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new SetOffActionToggleLoading({ isLoading: false });

	@Effect()
	loadSetOffPage$ = this.actions$
		.pipe(
			ofType<SetOffPageRequested>(SetOffActionTypes.SetOffPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.setOff.getListSetOff(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QuerySetOffModel = response[1];
				return new SetOffPageLoaded({
					setOff: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);
	@Effect()
	deleteSetOff$ = this.actions$
		.pipe(
			ofType<SetOffDeleted>(SetOffActionTypes.SetOffDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.setOff.deleteSetOff(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateSetOff = this.actions$
		.pipe(
			ofType<SetOffUpdated>(SetOffActionTypes.SetOffUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.setOff.updateSetOff(payload.setOff);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<SetOffOnServerCreated>(SetOffActionTypes.SetOffOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.setOff.createSetOff(payload.setOff).pipe(
					tap(res => {
						this.store.dispatch(new SetOffCreated({ setOff: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private setOff: SetOffService, private store: Store<AppState>) { }
}
