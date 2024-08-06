// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { TaskManagementMasterModel } from './taskManagementMaster.model';
import { QueryTaskManagementMasterModel } from './querytaskManagementMaster.model';
// Models

export enum TaskManagementMasterActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	TaskManagementMasterOnServerCreated = '[Edit TaskManagementMaster Component] TaskManagementMaster On Server Created',
	TaskManagementMasterCreated = '[Edit TaskManagementMaster Dialog] TaskManagementMaster Created',
	TaskManagementMasterUpdated = '[Edit TaskManagementMaster Dialog] TaskManagementMaster Updated',
	TaskManagementMasterDeleted = '[TaskManagementMaster List Page] TaskManagementMaster Deleted',
	TaskManagementMasterPageRequested = '[TaskManagementMaster List Page] TaskManagementMaster Page Requested',
	TaskManagementMasterPageLoaded = '[TaskManagementMaster API] TaskManagementMaster Page Loaded',
	TaskManagementMasterPageCancelled = '[TaskManagementMaster API] TaskManagementMaster Page Cancelled',
	TaskManagementMasterPageToggleLoading = '[TaskManagementMaster] TaskManagementMaster Page Toggle Loading',
	TaskManagementMasterActionToggleLoading = '[TaskManagementMaster] TaskManagementMaster Action Toggle Loading'
}
export class TaskManagementMasterOnServerCreated implements Action {
	readonly type = TaskManagementMasterActionTypes.TaskManagementMasterOnServerCreated;
	constructor(public payload: { taskManagementMaster: TaskManagementMasterModel }) { }
}

export class TaskManagementMasterCreated implements Action {
	readonly type = TaskManagementMasterActionTypes.TaskManagementMasterCreated;
	constructor(public payload: { taskManagementMaster: TaskManagementMasterModel }) { }
}


export class TaskManagementMasterUpdated implements Action {
	readonly type = TaskManagementMasterActionTypes.TaskManagementMasterUpdated;
	constructor(public payload: {
		partialTaskManagementMaster: Update<TaskManagementMasterModel>,
		taskManagementMaster: TaskManagementMasterModel
	}) { }
}

export class TaskManagementMasterDeleted implements Action {
	readonly type = TaskManagementMasterActionTypes.TaskManagementMasterDeleted;

	constructor(public payload: { id: string }) {}
}

export class TaskManagementMasterPageRequested implements Action {
	readonly type = TaskManagementMasterActionTypes.TaskManagementMasterPageRequested;
	constructor(public payload: { page: QueryTaskManagementMasterModel }) { }
}

export class TaskManagementMasterPageLoaded implements Action {
	readonly type = TaskManagementMasterActionTypes.TaskManagementMasterPageLoaded;
	constructor(public payload: { taskManagementMaster: TaskManagementMasterModel[], totalCount: number, page: QueryTaskManagementMasterModel  }) { }
}


export class TaskManagementMasterPageCancelled implements Action {
	readonly type = TaskManagementMasterActionTypes.TaskManagementMasterPageCancelled;
}

export class TaskManagementMasterPageToggleLoading implements Action {
	readonly type = TaskManagementMasterActionTypes.TaskManagementMasterPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class TaskManagementMasterActionToggleLoading implements Action {
	readonly type = TaskManagementMasterActionTypes.TaskManagementMasterActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type TaskManagementMasterActions = TaskManagementMasterCreated
	| TaskManagementMasterUpdated
	| TaskManagementMasterDeleted
	| TaskManagementMasterOnServerCreated
	| TaskManagementMasterPageLoaded
	| TaskManagementMasterPageCancelled
	| TaskManagementMasterPageToggleLoading
	| TaskManagementMasterPageRequested
	| TaskManagementMasterActionToggleLoading;
