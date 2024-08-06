// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { ApplicationModel } from './application.model';
import { QueryApplicationModel } from './queryapplication.model';
// Models

export enum ApplicationActionTypes {
	AllUsersRequested = '[Application Module] All Application Requested',
	AllUsersLoaded = '[Application API] All Application Loaded',
	ApplicationOnServerCreated = '[Edit Application Component] Application On Server Created',
	ApplicationCreated = '[Edit Application Dialog] Application Created',
	ApplicationUpdated = '[Edit Application Dialog] Application Updated',
	ApplicationDeleted = '[Application List Page] Application Deleted',
	ApplicationPageRequested = '[Application List Page] Application Page Requested',
	ApplicationPageLoaded = '[Application API] Application Page Loaded',
	ApplicationPageCancelled = '[Application API] Application Page Cancelled',
	ApplicationPageToggleLoading = '[Application] Application Page Toggle Loading',
	ApplicationActionToggleLoading = '[Application] Application Action Toggle Loading'
}
export class ApplicationOnServerCreated implements Action {
	readonly type = ApplicationActionTypes.ApplicationOnServerCreated;
	constructor(public payload: { application: ApplicationModel }) { }
}

export class ApplicationCreated implements Action {
	readonly type = ApplicationActionTypes.ApplicationCreated;
	constructor(public payload: { application: ApplicationModel }) { }
}


export class ApplicationUpdated implements Action {
	readonly type = ApplicationActionTypes.ApplicationUpdated;
	constructor(public payload: {
		partialApplication: Update<ApplicationModel>,
		application: ApplicationModel
	}) { }
}

export class ApplicationDeleted implements Action {
	readonly type = ApplicationActionTypes.ApplicationDeleted;

	constructor(public payload: { id: string }) {}
}

export class ApplicationPageRequested implements Action {
	readonly type = ApplicationActionTypes.ApplicationPageRequested;
	constructor(public payload: { page: QueryApplicationModel }) { }
}

export class ApplicationPageLoaded implements Action {
	readonly type = ApplicationActionTypes.ApplicationPageLoaded;
	constructor(public payload: { application: ApplicationModel[], totalCount: number, page: QueryApplicationModel  }) { }
}


export class ApplicationPageCancelled implements Action {
	readonly type = ApplicationActionTypes.ApplicationPageCancelled;
}

export class ApplicationPageToggleLoading implements Action {
	readonly type = ApplicationActionTypes.ApplicationPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class ApplicationActionToggleLoading implements Action {
	readonly type = ApplicationActionTypes.ApplicationActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type ApplicationActions = ApplicationCreated
	| ApplicationUpdated
	| ApplicationDeleted
	| ApplicationOnServerCreated
	| ApplicationPageLoaded
	| ApplicationPageCancelled
	| ApplicationPageToggleLoading
	| ApplicationPageRequested
	| ApplicationActionToggleLoading;
