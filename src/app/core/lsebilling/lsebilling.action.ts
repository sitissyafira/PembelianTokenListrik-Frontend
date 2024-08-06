// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { LsebillingModel } from './lsebilling.model';
import { QueryLsebillingModel } from './querylsebilling.model';
// Models

export enum LsebillingActionTypes {
	AllUsersRequested = '[Lsebilling Module] All Lsebilling Requested',
	AllUsersLoaded = '[Lsebilling API] All Lsebilling Loaded',
	LsebillingOnServerCreated = '[Edit Lsebilling Component] Lsebilling On Server Created',
	LsebillingCreated = '[Edit Lsebilling Dialog] Lsebilling Created',
	LsebillingUpdated = '[Edit Lsebilling Dialog] Lsebilling Updated',
	LsebillingDeleted = '[Lsebilling List Page] Lsebilling Deleted',
	LsebillingPageRequested = '[Lsebilling List Page] Lsebilling Page Requested',
	LsebillingPageLoaded = '[Lsebilling API] Lsebilling Page Loaded',
	LsebillingPageCancelled = '[Lsebilling API] Lsebilling Page Cancelled',
	LsebillingPageToggleLoading = '[Lsebilling] Lsebilling Page Toggle Loading',
	LsebillingActionToggleLoading = '[Lsebilling] Lsebilling Action Toggle Loading'
}
export class LsebillingOnServerCreated implements Action {
	readonly type = LsebillingActionTypes.LsebillingOnServerCreated;
	constructor(public payload: { lsebilling: LsebillingModel }) { }
}

export class LsebillingCreated implements Action {
	readonly type = LsebillingActionTypes.LsebillingCreated;
	constructor(public payload: { lsebilling: LsebillingModel }) { }
}


export class LsebillingUpdated implements Action {
	readonly type = LsebillingActionTypes.LsebillingUpdated;
	constructor(public payload: {
		partialLsebilling: Update<LsebillingModel>,
		lsebilling: LsebillingModel
	}) { }
}

export class LsebillingDeleted implements Action {
	readonly type = LsebillingActionTypes.LsebillingDeleted;

	constructor(public payload: { id: string }) {}
}

export class LsebillingPageRequested implements Action {
	readonly type = LsebillingActionTypes.LsebillingPageRequested;
	constructor(public payload: { page: QueryLsebillingModel }) { }
}

export class LsebillingPageLoaded implements Action {
	readonly type = LsebillingActionTypes.LsebillingPageLoaded;
	constructor(public payload: { lsebilling: LsebillingModel[], totalCount: number, page: QueryLsebillingModel  }) { }
}


export class LsebillingPageCancelled implements Action {
	readonly type = LsebillingActionTypes.LsebillingPageCancelled;
}

export class LsebillingPageToggleLoading implements Action {
	readonly type = LsebillingActionTypes.LsebillingPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class LsebillingActionToggleLoading implements Action {
	readonly type = LsebillingActionTypes.LsebillingActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type LsebillingActions = LsebillingCreated
	| LsebillingUpdated
	| LsebillingDeleted
	| LsebillingOnServerCreated
	| LsebillingPageLoaded
	| LsebillingPageCancelled
	| LsebillingPageToggleLoading
	| LsebillingPageRequested
	| LsebillingActionToggleLoading;
