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
import { ManagementTaskService } from './managementTask.service';
// State
import { AppState } from '../reducers';
import {
	ManagementTaskActionTypes,
	ManagementTaskPageRequested,
	ManagementTaskPageLoaded,
	ManagementTaskCreated,
	ManagementTaskDeleted,
	ManagementTaskUpdated,
	ManagementTaskOnServerCreated,
	ManagementTaskActionToggleLoading,
	ManagementTaskPageToggleLoading
} from './managementTask.action';
import { QueryManagementTaskModel } from './querymanagementTask.model';

@Injectable()
export class ManagementTaskEffect {
	showPageLoadingDistpatcher = new ManagementTaskPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ManagementTaskPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ManagementTaskActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ManagementTaskActionToggleLoading({ isLoading: false });

	@Effect()
	loadManagementTaskPage$ = this.actions$
		.pipe(
			ofType<ManagementTaskPageRequested>(ManagementTaskActionTypes.ManagementTaskPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.managementTask.getListManagementTask(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryManagementTaskModel = response[1];
				return new ManagementTaskPageLoaded({
					managementTask: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteManagementTask$ = this.actions$
		.pipe(
			ofType<ManagementTaskDeleted>(ManagementTaskActionTypes.ManagementTaskDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.managementTask.deleteManagementTask(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateManagementTask = this.actions$
		.pipe(
			ofType<ManagementTaskUpdated>(ManagementTaskActionTypes.ManagementTaskUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.managementTask.updateManagementTask(payload.managementTask);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createManagementTask$ = this.actions$
		.pipe(
			ofType<ManagementTaskOnServerCreated>(ManagementTaskActionTypes.ManagementTaskOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.managementTask.createManagementTask(payload.managementTask).pipe(
					tap(res => {
						this.store.dispatch(new ManagementTaskCreated({ managementTask: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private managementTask: ManagementTaskService, private store: Store<AppState>) { }
}
