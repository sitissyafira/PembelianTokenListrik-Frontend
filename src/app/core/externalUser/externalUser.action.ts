// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { ExternalUserModel } from './externalUser.model';
import { QueryExternalUserModel } from './queryexternalUser.model';
// Models

export enum ExternalUserActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	ExternalUserOnServerCreated = '[Edit ExternalUser Component] ExternalUser On Server Created',
	ExternalUserCreated = '[Edit ExternalUser Dialog] ExternalUser Created',
	ExternalUserUpdated = '[Edit ExternalUser Dialog] ExternalUser Updated',
	ExternalUserDeleted = '[ExternalUser List Page] ExternalUser Deleted',
	ExternalUserPageRequested = '[ExternalUser List Page] ExternalUser Page Requested',
	ExternalUserPageLoaded = '[ExternalUser API] ExternalUser Page Loaded',
	ExternalUserPageCancelled = '[ExternalUser API] ExternalUser Page Cancelled',
	ExternalUserPageToggleLoading = '[ExternalUser] ExternalUser Page Toggle Loading',
	ExternalUserActionToggleLoading = '[ExternalUser] ExternalUser Action Toggle Loading'
}
export class ExternalUserOnServerCreated implements Action {
	readonly type = ExternalUserActionTypes.ExternalUserOnServerCreated;
	constructor(public payload: { externalUser: ExternalUserModel }) { }
}

export class ExternalUserCreated implements Action {
	readonly type = ExternalUserActionTypes.ExternalUserCreated;
	constructor(public payload: { externalUser: ExternalUserModel }) { }
}


export class ExternalUserUpdated implements Action {
	readonly type = ExternalUserActionTypes.ExternalUserUpdated;
	constructor(public payload: {
		partialExternalUser: Update<ExternalUserModel>,
		externalUser: ExternalUserModel
	}) { }
}

export class ExternalUserDeleted implements Action {
	readonly type = ExternalUserActionTypes.ExternalUserDeleted;

	constructor(public payload: { id: string }) {}
}

export class ExternalUserPageRequested implements Action {
	readonly type = ExternalUserActionTypes.ExternalUserPageRequested;
	constructor(public payload: { page: QueryExternalUserModel }) { }
}

export class ExternalUserPageLoaded implements Action {
	readonly type = ExternalUserActionTypes.ExternalUserPageLoaded;
	constructor(public payload: { externalUser: ExternalUserModel[], totalCount: number, page: QueryExternalUserModel  }) { }
}


export class ExternalUserPageCancelled implements Action {
	readonly type = ExternalUserActionTypes.ExternalUserPageCancelled;
}

export class ExternalUserPageToggleLoading implements Action {
	readonly type = ExternalUserActionTypes.ExternalUserPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class ExternalUserActionToggleLoading implements Action {
	readonly type = ExternalUserActionTypes.ExternalUserActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type ExternalUserActions = ExternalUserCreated
	| ExternalUserUpdated
	| ExternalUserDeleted
	| ExternalUserOnServerCreated
	| ExternalUserPageLoaded
	| ExternalUserPageCancelled
	| ExternalUserPageToggleLoading
	| ExternalUserPageRequested
	| ExternalUserActionToggleLoading;
