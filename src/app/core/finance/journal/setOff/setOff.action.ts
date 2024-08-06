// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { SetOffModel } from './setOff.model';
import { QuerySetOffModel } from './querysetOff.model';
// Models

export enum SetOffActionTypes {
	AllUsersRequested = '[SetOff Module] All SetOff Requested',
	AllUsersLoaded = '[SetOff API] All SetOff Loaded',
	SetOffOnServerCreated = '[Edit SetOff Component] SetOff On Server Created',
	SetOffCreated = '[Edit SetOff Dialog] SetOff Created',
	SetOffUpdated = '[Edit SetOff Dialog] SetOff Updated',
	SetOffDeleted = '[SetOff List Page] SetOff Deleted',
	SetOffPageRequested = '[SetOff List Page] SetOff Page Requested',
	SetOffPageLoaded = '[SetOff API] SetOff Page Loaded',
	SetOffPageCancelled = '[SetOff API] SetOff Page Cancelled',
	SetOffPageToggleLoading = '[SetOff] SetOff Page Toggle Loading',
	SetOffActionToggleLoading = '[SetOff] SetOff Action Toggle Loading'
}
export class SetOffOnServerCreated implements Action {
	readonly type = SetOffActionTypes.SetOffOnServerCreated;
	constructor(public payload: { setOff: SetOffModel }) { }
}

export class SetOffCreated implements Action {
	readonly type = SetOffActionTypes.SetOffCreated;
	constructor(public payload: { setOff: SetOffModel }) { }
}


export class SetOffUpdated implements Action {
	readonly type = SetOffActionTypes.SetOffUpdated;
	constructor(public payload: {
		psetOfftialSetOff: Update<SetOffModel>,
		setOff: SetOffModel
	}) { }
}

export class SetOffDeleted implements Action {
	readonly type = SetOffActionTypes.SetOffDeleted;

	constructor(public payload: { id: string }) { }
}

export class SetOffPageRequested implements Action {
	readonly type = SetOffActionTypes.SetOffPageRequested;
	constructor(public payload: { page: QuerySetOffModel }) { }
}

export class SetOffPageLoaded implements Action {
	readonly type = SetOffActionTypes.SetOffPageLoaded;
	constructor(public payload: { setOff: SetOffModel[], totalCount: number, page: QuerySetOffModel }) { }
}


export class SetOffPageCancelled implements Action {
	readonly type = SetOffActionTypes.SetOffPageCancelled;
}

export class SetOffPageToggleLoading implements Action {
	readonly type = SetOffActionTypes.SetOffPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class SetOffActionToggleLoading implements Action {
	readonly type = SetOffActionTypes.SetOffActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type SetOffActions = SetOffCreated
	| SetOffUpdated
	| SetOffDeleted
	| SetOffOnServerCreated
	| SetOffPageLoaded
	| SetOffPageCancelled
	| SetOffPageToggleLoading
	| SetOffPageRequested
	| SetOffActionToggleLoading;
