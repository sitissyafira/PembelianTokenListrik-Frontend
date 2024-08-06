// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { PosModel } from './pos.model';
import { QueryPosModel } from './querypos.model';
// Models

export enum PosActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	PosOnServerCreated = '[Edit Pos Component] Pos On Server Created',
	PosCreated = '[Edit Pos Dialog] Pos Created',
	PosUpdated = '[Edit Pos Dialog] Pos Updated',
	PosDeleted = '[Pos List Page] Pos Deleted',
	PosPageRequested = '[Pos List Page] Pos Page Requested',
	PosPageLoaded = '[Pos API] Pos Page Loaded',
	PosPageCancelled = '[Pos API] Pos Page Cancelled',
	PosPageToggleLoading = '[Pos] Pos Page Toggle Loading',
	PosActionToggleLoading = '[Pos] Pos Action Toggle Loading'
}
export class PosOnServerCreated implements Action {
	readonly type = PosActionTypes.PosOnServerCreated;
	constructor(public payload: { pos: PosModel }) { }
}

export class PosCreated implements Action {
	readonly type = PosActionTypes.PosCreated;
	constructor(public payload: { pos: PosModel }) { }
}


export class PosUpdated implements Action {
	readonly type = PosActionTypes.PosUpdated;
	constructor(public payload: {
		partialPos: Update<PosModel>,
		pos: PosModel
	}) { }
}

export class PosDeleted implements Action {
	readonly type = PosActionTypes.PosDeleted;

	constructor(public payload: { id: string }) { }
}

export class PosPageRequested implements Action {
	readonly type = PosActionTypes.PosPageRequested;
	constructor(public payload: { page: QueryPosModel }) { }
}

export class PosPageLoaded implements Action {
	readonly type = PosActionTypes.PosPageLoaded;
	constructor(public payload: { pos: PosModel[], totalCount: number, page: QueryPosModel }) { }
}


export class PosPageCancelled implements Action {
	readonly type = PosActionTypes.PosPageCancelled;
}

export class PosPageToggleLoading implements Action {
	readonly type = PosActionTypes.PosPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class PosActionToggleLoading implements Action {
	readonly type = PosActionTypes.PosActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type PosActions = PosCreated
	| PosUpdated
	| PosDeleted
	| PosOnServerCreated
	| PosPageLoaded
	| PosPageCancelled
	| PosPageToggleLoading
	| PosPageRequested
	| PosActionToggleLoading;
