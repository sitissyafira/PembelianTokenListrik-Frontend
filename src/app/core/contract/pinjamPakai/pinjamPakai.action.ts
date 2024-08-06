// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { PinjamPakaiModel } from './pinjamPakai.model';
import { QueryPinjamPakaiModel } from './querypinjamPakai.model';
// Models

export enum PinjamPakaiActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	PinjamPakaiOnServerCreated = '[Edit PinjamPakai Component] PinjamPakai On Server Created',
	PinjamPakaiCreated = '[Edit PinjamPakai Dialog] PinjamPakai Created',
	PinjamPakaiUpdated = '[Edit PinjamPakai Dialog] PinjamPakai Updated',
	PinjamPakaiDeleted = '[PinjamPakai List Page] PinjamPakai Deleted',
	PinjamPakaiPageRequested = '[PinjamPakai List Page] PinjamPakai Page Requested',
	PinjamPakaiPageLoaded = '[PinjamPakai API] PinjamPakai Page Loaded',
	PinjamPakaiPageCancelled = '[PinjamPakai API] PinjamPakai Page Cancelled',
	PinjamPakaiPageToggleLoading = '[PinjamPakai] PinjamPakai Page Toggle Loading',
	PinjamPakaiActionToggleLoading = '[PinjamPakai] PinjamPakai Action Toggle Loading'
}
export class PinjamPakaiOnServerCreated implements Action {
	readonly type = PinjamPakaiActionTypes.PinjamPakaiOnServerCreated;
	constructor(public payload: { pinjamPakai: PinjamPakaiModel }) { }
}

export class PinjamPakaiCreated implements Action {
	readonly type = PinjamPakaiActionTypes.PinjamPakaiCreated;
	constructor(public payload: { pinjamPakai: PinjamPakaiModel }) { }
}


export class PinjamPakaiUpdated implements Action {
	readonly type = PinjamPakaiActionTypes.PinjamPakaiUpdated;
	constructor(public payload: {
		partialPinjamPakai: Update<PinjamPakaiModel>,
		pinjamPakai: PinjamPakaiModel
	}) { }
}

export class PinjamPakaiDeleted implements Action {
	readonly type = PinjamPakaiActionTypes.PinjamPakaiDeleted;

	constructor(public payload: { id: string }) {}
}

export class PinjamPakaiPageRequested implements Action {
	readonly type = PinjamPakaiActionTypes.PinjamPakaiPageRequested;
	constructor(public payload: { page: QueryPinjamPakaiModel }) { }
}

export class PinjamPakaiPageLoaded implements Action {
	readonly type = PinjamPakaiActionTypes.PinjamPakaiPageLoaded;
	constructor(public payload: { pinjamPakai: PinjamPakaiModel[], totalCount: number, page: QueryPinjamPakaiModel  }) { }
}


export class PinjamPakaiPageCancelled implements Action {
	readonly type = PinjamPakaiActionTypes.PinjamPakaiPageCancelled;
}

export class PinjamPakaiPageToggleLoading implements Action {
	readonly type = PinjamPakaiActionTypes.PinjamPakaiPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class PinjamPakaiActionToggleLoading implements Action {
	readonly type = PinjamPakaiActionTypes.PinjamPakaiActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type PinjamPakaiActions = PinjamPakaiCreated
	| PinjamPakaiUpdated
	| PinjamPakaiDeleted
	| PinjamPakaiOnServerCreated
	| PinjamPakaiPageLoaded
	| PinjamPakaiPageCancelled
	| PinjamPakaiPageToggleLoading
	| PinjamPakaiPageRequested
	| PinjamPakaiActionToggleLoading;
