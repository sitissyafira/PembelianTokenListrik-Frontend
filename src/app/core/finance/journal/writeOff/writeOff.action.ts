// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { WriteOffModel } from './writeOff.model';
import { QueryWriteOffModel } from './querywriteOff.model';
// Models

export enum WriteOffActionTypes {
	AllUsersRequested = '[WriteOff Module] All WriteOff Requested',
	AllUsersLoaded = '[WriteOff API] All WriteOff Loaded',
	WriteOffOnServerCreated = '[Edit WriteOff Component] WriteOff On Server Created',
	WriteOffCreated = '[Edit WriteOff Dialog] WriteOff Created',
	WriteOffUpdated = '[Edit WriteOff Dialog] WriteOff Updated',
	WriteOffDeleted = '[WriteOff List Page] WriteOff Deleted',
	WriteOffPageRequested = '[WriteOff List Page] WriteOff Page Requested',
	WriteOffPageLoaded = '[WriteOff API] WriteOff Page Loaded',
	WriteOffPageCancelled = '[WriteOff API] WriteOff Page Cancelled',
	WriteOffPageToggleLoading = '[WriteOff] WriteOff Page Toggle Loading',
	WriteOffActionToggleLoading = '[WriteOff] WriteOff Action Toggle Loading'
}
export class WriteOffOnServerCreated implements Action {
	readonly type = WriteOffActionTypes.WriteOffOnServerCreated;
	constructor(public payload: { writeOff: WriteOffModel }) { }
}

export class WriteOffCreated implements Action {
	readonly type = WriteOffActionTypes.WriteOffCreated;
	constructor(public payload: { writeOff: WriteOffModel }) { }
}


export class WriteOffUpdated implements Action {
	readonly type = WriteOffActionTypes.WriteOffUpdated;
	constructor(public payload: {
		pwriteOfftialWriteOff: Update<WriteOffModel>,
		writeOff: WriteOffModel
	}) { }
}

export class WriteOffDeleted implements Action {
	readonly type = WriteOffActionTypes.WriteOffDeleted;

	constructor(public payload: { id: string }) { }
}

export class WriteOffPageRequested implements Action {
	readonly type = WriteOffActionTypes.WriteOffPageRequested;
	constructor(public payload: { page: QueryWriteOffModel }) { }
}

export class WriteOffPageLoaded implements Action {
	readonly type = WriteOffActionTypes.WriteOffPageLoaded;
	constructor(public payload: { writeOff: WriteOffModel[], totalCount: number, page: QueryWriteOffModel }) { }
}


export class WriteOffPageCancelled implements Action {
	readonly type = WriteOffActionTypes.WriteOffPageCancelled;
}

export class WriteOffPageToggleLoading implements Action {
	readonly type = WriteOffActionTypes.WriteOffPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class WriteOffActionToggleLoading implements Action {
	readonly type = WriteOffActionTypes.WriteOffActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type WriteOffActions = WriteOffCreated
	| WriteOffUpdated
	| WriteOffDeleted
	| WriteOffOnServerCreated
	| WriteOffPageLoaded
	| WriteOffPageCancelled
	| WriteOffPageToggleLoading
	| WriteOffPageRequested
	| WriteOffActionToggleLoading;
