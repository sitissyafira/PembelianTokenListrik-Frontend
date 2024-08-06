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
import { SubdefectService } from './subdefect.service';
// State
import { AppState } from '../../core/reducers';
import {
	SubdefectActionTypes,
	SubdefectPageRequested,
	SubdefectPageLoaded,
	SubdefectCreated,
	SubdefectDeleted,
	SubdefectUpdated,
	SubdefectOnServerCreated,
	SubdefectActionToggleLoading,
	SubdefectPageToggleLoading
} from './subdefect.action';
import { QuerySubdefectModel } from './querysubdefect.model';


@Injectable()
export class SubdefectEffect {
	showPageLoadingDistpatcher = new SubdefectPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new SubdefectPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new SubdefectActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new SubdefectActionToggleLoading({ isLoading: false });

	@Effect()
	loadSubdefectPage$ = this.actions$
		.pipe(
			ofType<SubdefectPageRequested>(SubdefectActionTypes.SubdefectPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.subdefect.getListSubdefect(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QuerySubdefectModel = response[1];
				return new SubdefectPageLoaded({
					subdefect: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteSubdefect$ = this.actions$
		.pipe(
			ofType<SubdefectDeleted>(SubdefectActionTypes.SubdefectDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.subdefect.deleteSubdefect(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateSubdefect = this.actions$
		.pipe(
			ofType<SubdefectUpdated>(SubdefectActionTypes.SubdefectUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.subdefect.updateSubdefect(payload.subdefect);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<SubdefectOnServerCreated>(SubdefectActionTypes.SubdefectOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.subdefect.createSubdefect(payload.subdefect).pipe(
					tap(res => {
						this.store.dispatch(new SubdefectCreated({ subdefect: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private subdefect: SubdefectService, private store: Store<AppState>) { }
}
