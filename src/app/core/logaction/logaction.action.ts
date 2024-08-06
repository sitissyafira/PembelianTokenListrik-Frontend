// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { LogactionModel } from './logaction.model';
import { QueryLogactionModel } from './querylogaction.model';
// Models

export enum LogactionActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	LogactionOnServerCreated = '[Edit Logaction Component] Logaction On Server Created',
	LogactionCreated = '[Edit Logaction Dialog] Logaction Created',
	LogactionUpdated = '[Edit Logaction Dialog] Logaction Updated',
	LogactionDeleted = '[Logaction List Page] Logaction Deleted',
	LogactionPageRequested = '[Logaction List Page] Logaction Page Requested',
	LogactionPageLoaded = '[Logaction API] Logaction Page Loaded',
	LogactionPageCancelled = '[Logaction API] Logaction Page Cancelled',
	LogactionPageToggleLoading = '[Logaction] Logaction Page Toggle Loading',
	LogactionActionToggleLoading = '[Logaction] Logaction Action Toggle Loading'
}
export class LogactionOnServerCreated implements Action {
	readonly type = LogactionActionTypes.LogactionOnServerCreated;
	constructor(public payload: { logaction: LogactionModel }) { }
}

export class LogactionCreated implements Action {
	readonly type = LogactionActionTypes.LogactionCreated;
	constructor(public payload: { logaction: LogactionModel }) { }
}


export class LogactionUpdated implements Action {
	readonly type = LogactionActionTypes.LogactionUpdated;
	constructor(public payload: {
		partialLogaction: Update<LogactionModel>,
		logaction: LogactionModel
	}) { }
}

export class LogactionDeleted implements Action {
	readonly type = LogactionActionTypes.LogactionDeleted;
	constructor(public payload: { id: string }) { }
}

export class LogactionPageRequested implements Action {
	readonly type = LogactionActionTypes.LogactionPageRequested;
	constructor(public payload: { page: QueryLogactionModel }) { }
}

export class LogactionPageLoaded implements Action {
	readonly type = LogactionActionTypes.LogactionPageLoaded;
	constructor(public payload: { logaction: LogactionModel[], totalCount: number, page: QueryLogactionModel }) { }
}


export class LogactionPageCancelled implements Action {
	readonly type = LogactionActionTypes.LogactionPageCancelled;
}

export class LogactionPageToggleLoading implements Action {
	readonly type = LogactionActionTypes.LogactionPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class LogactionActionToggleLoading implements Action {
	readonly type = LogactionActionTypes.LogactionActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type LogactionActions = LogactionCreated
	| LogactionUpdated
	| LogactionDeleted
	| LogactionOnServerCreated
	| LogactionPageLoaded
	| LogactionPageCancelled
	| LogactionPageToggleLoading
	| LogactionPageRequested
	| LogactionActionToggleLoading;
