// AngulwriteOff
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
import { WriteOffService } from './writeOff.service';
// State
import { AppState } from '../../../reducers';
import {
	WriteOffActionTypes,
	WriteOffPageRequested,
	WriteOffPageLoaded,
	WriteOffCreated,
	WriteOffDeleted,
	WriteOffUpdated,
	WriteOffOnServerCreated,
	WriteOffActionToggleLoading,
	WriteOffPageToggleLoading
} from './writeOff.action';
import { QueryWriteOffModel } from './querywriteOff.model';


@Injectable()
export class WriteOffEffect {
	showPageLoadingDistpatcher = new WriteOffPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new WriteOffPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new WriteOffActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new WriteOffActionToggleLoading({ isLoading: false });

	@Effect()
	loadWriteOffPage$ = this.actions$
		.pipe(
			ofType<WriteOffPageRequested>(WriteOffActionTypes.WriteOffPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.writeOff.getListWriteOff(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryWriteOffModel = response[1];
				return new WriteOffPageLoaded({
					writeOff: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);
	@Effect()
	deleteWriteOff$ = this.actions$
		.pipe(
			ofType<WriteOffDeleted>(WriteOffActionTypes.WriteOffDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.writeOff.deleteWriteOff(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateWriteOff = this.actions$
		.pipe(
			ofType<WriteOffUpdated>(WriteOffActionTypes.WriteOffUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.writeOff.updateWriteOff(payload.writeOff);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<WriteOffOnServerCreated>(WriteOffActionTypes.WriteOffOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.writeOff.createWriteOff(payload.writeOff).pipe(
					tap(res => {
						this.store.dispatch(new WriteOffCreated({ writeOff: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private writeOff: WriteOffService, private store: Store<AppState>) { }
}
