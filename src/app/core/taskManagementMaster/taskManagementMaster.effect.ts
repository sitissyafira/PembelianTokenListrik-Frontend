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
import { TaskManagementMasterService } from './taskManagementMaster.service';
// State
import { AppState } from '../reducers';
import {
	TaskManagementMasterActionTypes,
	TaskManagementMasterPageRequested,
	TaskManagementMasterPageLoaded,
	TaskManagementMasterCreated,
	TaskManagementMasterDeleted,
	TaskManagementMasterUpdated,
	TaskManagementMasterOnServerCreated,
	TaskManagementMasterActionToggleLoading,
	TaskManagementMasterPageToggleLoading
} from './taskManagementMaster.action';
import { QueryTaskManagementMasterModel } from './querytaskManagementMaster.model';

@Injectable()
export class TaskManagementMasterEffect {
	showPageLoadingDistpatcher = new TaskManagementMasterPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new TaskManagementMasterPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new TaskManagementMasterActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new TaskManagementMasterActionToggleLoading({ isLoading: false });

	@Effect()
	loadTaskManagementMasterPage$ = this.actions$
		.pipe(
			ofType<TaskManagementMasterPageRequested>(TaskManagementMasterActionTypes.TaskManagementMasterPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.taskManagementMaster.getListTaskManagementMaster(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryTaskManagementMasterModel = response[1];
				return new TaskManagementMasterPageLoaded({
					taskManagementMaster: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteTaskManagementMaster$ = this.actions$
		.pipe(
			ofType<TaskManagementMasterDeleted>(TaskManagementMasterActionTypes.TaskManagementMasterDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.taskManagementMaster.deleteTaskManagementMaster(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateTaskManagementMaster = this.actions$
		.pipe(
			ofType<TaskManagementMasterUpdated>(TaskManagementMasterActionTypes.TaskManagementMasterUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.taskManagementMaster.updateTaskManagementMaster(payload.taskManagementMaster);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createTaskManagementMaster$ = this.actions$
		.pipe(
			ofType<TaskManagementMasterOnServerCreated>(TaskManagementMasterActionTypes.TaskManagementMasterOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.taskManagementMaster.createTaskManagementMaster(payload.taskManagementMaster).pipe(
					tap(res => {
						this.store.dispatch(new TaskManagementMasterCreated({ taskManagementMaster: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private taskManagementMaster: TaskManagementMasterService, private store: Store<AppState>) { }
}
