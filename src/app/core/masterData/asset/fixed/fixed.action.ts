// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { FixedModel } from './fixed.model';
import { QueryFixedModel } from './queryfixed.model';
// Models

export enum FixedActionTypes {
	AllUsersRequested = '[Fixed Module] All Fixed Requested',
	AllUsersLoaded = '[Fixed API] All Fixed Loaded',
	FixedOnServerCreated = '[Edit Fixed Component] Fixed On Server Created',
	FixedCreated = '[Edit Fixed Dialog] Fixed Created',
	FixedUpdated = '[Edit Fixed Dialog] Fixed Updated',
	FixedDeleted = '[Fixed List Page] Fixed Deleted',
	FixedPageRequested = '[Fixed List Page] Fixed Page Requested',
	FixedPageLoaded = '[Fixed API] Fixed Page Loaded',
	FixedPageCancelled = '[Fixed API] Fixed Page Cancelled',
	FixedPageToggleLoading = '[Fixed] Fixed Page Toggle Loading',
	FixedActionToggleLoading = '[Fixed] Fixed Action Toggle Loading'
}
export class FixedOnServerCreated implements Action {
	readonly type = FixedActionTypes.FixedOnServerCreated;
	constructor(public payload: { fixed: FixedModel }) { }
}

export class FixedCreated implements Action {
	readonly type = FixedActionTypes.FixedCreated;
	constructor(public payload: { fixed: FixedModel }) { }
}


export class FixedUpdated implements Action {
	readonly type = FixedActionTypes.FixedUpdated;
	constructor(public payload: {
		partialFixed: Update<FixedModel>,
		fixed: FixedModel
	}) { }
}

export class FixedDeleted implements Action {
	readonly type = FixedActionTypes.FixedDeleted;

	constructor(public payload: { id: string }) {}
}

export class FixedPageRequested implements Action {
	readonly type = FixedActionTypes.FixedPageRequested;
	constructor(public payload: { page: QueryFixedModel }) { }
}

export class FixedPageLoaded implements Action {
	readonly type = FixedActionTypes.FixedPageLoaded;
	constructor(public payload: { fixed: FixedModel[], totalCount: number, page: QueryFixedModel  }) { }
}


export class FixedPageCancelled implements Action {
	readonly type = FixedActionTypes.FixedPageCancelled;
}

export class FixedPageToggleLoading implements Action {
	readonly type = FixedActionTypes.FixedPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class FixedActionToggleLoading implements Action {
	readonly type = FixedActionTypes.FixedActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type FixedActions = FixedCreated
	| FixedUpdated
	| FixedDeleted
	| FixedOnServerCreated
	| FixedPageLoaded
	| FixedPageCancelled
	| FixedPageToggleLoading
	| FixedPageRequested
	| FixedActionToggleLoading;
