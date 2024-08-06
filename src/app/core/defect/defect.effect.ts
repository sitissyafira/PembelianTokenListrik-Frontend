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
import { DefectService } from './defect.service';
// State
import { AppState } from '../../core/reducers';
import {
	DefectActionTypes,
	DefectPageRequested,
	DefectPageLoaded,
	DefectCreated,
	DefectDeleted,
	DefectUpdated,
	DefectOnServerCreated,
	DefectActionToggleLoading,
	DefectPageToggleLoading
} from './defect.action';
import { QueryDefectModel } from './querydefect.model';


@Injectable()
export class DefectEffect {
	showPageLoadingDistpatcher = new DefectPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new DefectPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new DefectActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new DefectActionToggleLoading({ isLoading: false });

	@Effect()
	loadDefectPage$ = this.actions$
		.pipe(
			ofType<DefectPageRequested>(DefectActionTypes.DefectPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.defect.getListDefect(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryDefectModel = response[1];
				return new DefectPageLoaded({
					defect: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteDefect$ = this.actions$
		.pipe(
			ofType<DefectDeleted>(DefectActionTypes.DefectDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.defect.deleteDefect(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateDefect = this.actions$
		.pipe(
			ofType<DefectUpdated>(DefectActionTypes.DefectUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.defect.updateDefect(payload.defect);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<DefectOnServerCreated>(DefectActionTypes.DefectOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.defect.createDefect(payload.defect).pipe(
					tap(res => {
						this.store.dispatch(new DefectCreated({ defect: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private defect: DefectService, private store: Store<AppState>) { }
}
