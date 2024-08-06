// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { ManagementTaskModel } from './managementTask.model';
import { QueryManagementTaskModel } from './querymanagementTask.model';
// Models

export enum ManagementTaskActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	ManagementTaskOnServerCreated = '[Edit ManagementTask Component] ManagementTask On Server Created',
	ManagementTaskCreated = '[Edit ManagementTask Dialog] ManagementTask Created',
	ManagementTaskUpdated = '[Edit ManagementTask Dialog] ManagementTask Updated',
	ManagementTaskDeleted = '[ManagementTask List Page] ManagementTask Deleted',
	ManagementTaskPageRequested = '[ManagementTask List Page] ManagementTask Page Requested',
	ManagementTaskPageLoaded = '[ManagementTask API] ManagementTask Page Loaded',
	ManagementTaskPageCancelled = '[ManagementTask API] ManagementTask Page Cancelled',
	ManagementTaskPageToggleLoading = '[ManagementTask] ManagementTask Page Toggle Loading',
	ManagementTaskActionToggleLoading = '[ManagementTask] ManagementTask Action Toggle Loading'
}
export class ManagementTaskOnServerCreated implements Action {
	readonly type = ManagementTaskActionTypes.ManagementTaskOnServerCreated;
	constructor(public payload: { managementTask: ManagementTaskModel }) { }
}

export class ManagementTaskCreated implements Action {
	readonly type = ManagementTaskActionTypes.ManagementTaskCreated;
	constructor(public payload: { managementTask: ManagementTaskModel }) { }
}


export class ManagementTaskUpdated implements Action {
	readonly type = ManagementTaskActionTypes.ManagementTaskUpdated;
	constructor(public payload: {
		partialManagementTask: Update<ManagementTaskModel>,
		managementTask: ManagementTaskModel
	}) { }
}

export class ManagementTaskDeleted implements Action {
	readonly type = ManagementTaskActionTypes.ManagementTaskDeleted;

	constructor(public payload: { id: string }) {}
}

export class ManagementTaskPageRequested implements Action {
	readonly type = ManagementTaskActionTypes.ManagementTaskPageRequested;
	constructor(public payload: { page: QueryManagementTaskModel }) { }
}

export class ManagementTaskPageLoaded implements Action {
	readonly type = ManagementTaskActionTypes.ManagementTaskPageLoaded;
	constructor(public payload: { managementTask: ManagementTaskModel[], totalCount: number, page: QueryManagementTaskModel  }) { }
}


export class ManagementTaskPageCancelled implements Action {
	readonly type = ManagementTaskActionTypes.ManagementTaskPageCancelled;
}

export class ManagementTaskPageToggleLoading implements Action {
	readonly type = ManagementTaskActionTypes.ManagementTaskPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class ManagementTaskActionToggleLoading implements Action {
	readonly type = ManagementTaskActionTypes.ManagementTaskActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type ManagementTaskActions = ManagementTaskCreated
	| ManagementTaskUpdated
	| ManagementTaskDeleted
	| ManagementTaskOnServerCreated
	| ManagementTaskPageLoaded
	| ManagementTaskPageCancelled
	| ManagementTaskPageToggleLoading
	| ManagementTaskPageRequested
	| ManagementTaskActionToggleLoading;
