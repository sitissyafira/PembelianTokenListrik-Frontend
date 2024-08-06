// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { RoleModel } from './role.model';
import { QueryRoleModel } from './queryrole.model';
// Models

export enum RoleActionTypes {
	AllUsersRequested = '[Role Module] All Role Requested',
	AllUsersLoaded = '[Role API] All Role Loaded',
	RoleOnServerCreated = '[Edit Role Component] Role On Server Created',
	RoleCreated = '[Edit Role Dialog] Role Created',
	RoleUpdated = '[Edit Role Dialog] Role Updated',
	RoleDeleted = '[Role List Page] Role Deleted',
	RolePageRequested = '[Role List Page] Role Page Requested',
	RolePageLoaded = '[Role API] Role Page Loaded',
	RolePageCancelled = '[Role API] Role Page Cancelled',
	RolePageToggleLoading = '[Role] Role Page Toggle Loading',
	RoleActionToggleLoading = '[Role] Role Action Toggle Loading'
}
export class RoleOnServerCreated implements Action {
	readonly type = RoleActionTypes.RoleOnServerCreated;
	constructor(public payload: { role: RoleModel }) { }
}

export class RoleCreated implements Action {
	readonly type = RoleActionTypes.RoleCreated;
	constructor(public payload: { role: RoleModel }) { }
}


export class RoleUpdated implements Action {
	readonly type = RoleActionTypes.RoleUpdated;
	constructor(public payload: {
		partialRole: Update<RoleModel>,
		role: RoleModel
	}) { }
}

export class RoleDeleted implements Action {
	readonly type = RoleActionTypes.RoleDeleted;

	constructor(public payload: { id: string }) {}
}

export class RolePageRequested implements Action {
	readonly type = RoleActionTypes.RolePageRequested;
	constructor(public payload: { page: QueryRoleModel }) { }
}

export class RolePageLoaded implements Action {
	readonly type = RoleActionTypes.RolePageLoaded;
	constructor(public payload: { role: RoleModel[], totalCount: number, page: QueryRoleModel  }) { }
}


export class RolePageCancelled implements Action {
	readonly type = RoleActionTypes.RolePageCancelled;
}

export class RolePageToggleLoading implements Action {
	readonly type = RoleActionTypes.RolePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class RoleActionToggleLoading implements Action {
	readonly type = RoleActionTypes.RoleActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type RoleActions = RoleCreated
	| RoleUpdated
	| RoleDeleted
	| RoleOnServerCreated
	| RolePageLoaded
	| RolePageCancelled
	| RolePageToggleLoading
	| RolePageRequested
	| RoleActionToggleLoading;
