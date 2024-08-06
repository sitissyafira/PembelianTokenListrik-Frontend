// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { InternalUserModel } from './internalUser.model';
import { QueryInternalUserModel } from './queryinternalUser.model';
// Models

export enum InternalUserActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	InternalUserOnServerCreated = '[Edit InternalUser Component] InternalUser On Server Created',
	InternalUserCreated = '[Edit InternalUser Dialog] InternalUser Created',
	InternalUserUpdated = '[Edit InternalUser Dialog] InternalUser Updated',
	InternalUserDeleted = '[InternalUser List Page] InternalUser Deleted',
	InternalUserPageRequested = '[InternalUser List Page] InternalUser Page Requested',
	InternalUserPageLoaded = '[InternalUser API] InternalUser Page Loaded',
	InternalUserPageCancelled = '[InternalUser API] InternalUser Page Cancelled',
	InternalUserPageToggleLoading = '[InternalUser] InternalUser Page Toggle Loading',
	InternalUserActionToggleLoading = '[InternalUser] InternalUser Action Toggle Loading'
}
export class InternalUserOnServerCreated implements Action {
	readonly type = InternalUserActionTypes.InternalUserOnServerCreated;
	constructor(public payload: { internalUser: InternalUserModel }) { }
}

export class InternalUserCreated implements Action {
	readonly type = InternalUserActionTypes.InternalUserCreated;
	constructor(public payload: { internalUser: InternalUserModel }) { }
}


export class InternalUserUpdated implements Action {
	readonly type = InternalUserActionTypes.InternalUserUpdated;
	constructor(public payload: {
		partialInternalUser: Update<InternalUserModel>,
		internalUser: InternalUserModel
	}) { }
}

export class InternalUserDeleted implements Action {
	readonly type = InternalUserActionTypes.InternalUserDeleted;

	constructor(public payload: { id: string }) {}
}

export class InternalUserPageRequested implements Action {
	readonly type = InternalUserActionTypes.InternalUserPageRequested;
	constructor(public payload: { page: QueryInternalUserModel }) { }
}

export class InternalUserPageLoaded implements Action {
	readonly type = InternalUserActionTypes.InternalUserPageLoaded;
	constructor(public payload: { internalUser: InternalUserModel[], totalCount: number, page: QueryInternalUserModel  }) { }
}


export class InternalUserPageCancelled implements Action {
	readonly type = InternalUserActionTypes.InternalUserPageCancelled;
}

export class InternalUserPageToggleLoading implements Action {
	readonly type = InternalUserActionTypes.InternalUserPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class InternalUserActionToggleLoading implements Action {
	readonly type = InternalUserActionTypes.InternalUserActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type InternalUserActions = InternalUserCreated
	| InternalUserUpdated
	| InternalUserDeleted
	| InternalUserOnServerCreated
	| InternalUserPageLoaded
	| InternalUserPageCancelled
	| InternalUserPageToggleLoading
	| InternalUserPageRequested
	| InternalUserActionToggleLoading;
