// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { PatroliModel } from './patroli.model';
import { QueryPatroliModel } from './querypatroli.model';
// Models

export enum PatroliActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	PatroliOnServerCreated = '[Edit Patroli Component] Patroli On Server Created',
	PatroliCreated = '[Edit Patroli Dialog] Patroli Created',
	PatroliUpdated = '[Edit Patroli Dialog] Patroli Updated',
	PatroliDeleted = '[Patroli List Page] Patroli Deleted',
	PatroliPageRequested = '[Patroli List Page] Patroli Page Requested',
	PatroliPageLoaded = '[Patroli API] Patroli Page Loaded',
	PatroliPageCancelled = '[Patroli API] Patroli Page Cancelled',
	PatroliPageToggleLoading = '[Patroli] Patroli Page Toggle Loading',
	PatroliActionToggleLoading = '[Patroli] Patroli Action Toggle Loading'
}
export class PatroliOnServerCreated implements Action {
	readonly type = PatroliActionTypes.PatroliOnServerCreated;
	constructor(public payload: { patroli: PatroliModel }) { }
}

export class PatroliCreated implements Action {
	readonly type = PatroliActionTypes.PatroliCreated;
	constructor(public payload: { patroli: PatroliModel }) { }
}


export class PatroliUpdated implements Action {
	readonly type = PatroliActionTypes.PatroliUpdated;
	constructor(public payload: {
		partialPatroli: Update<PatroliModel>,
		patroli: PatroliModel
	}) { }
}

export class PatroliDeleted implements Action {
	readonly type = PatroliActionTypes.PatroliDeleted;

	constructor(public payload: { id: string }) {}
}

export class PatroliPageRequested implements Action {
	readonly type = PatroliActionTypes.PatroliPageRequested;
	constructor(public payload: { page: QueryPatroliModel }) { }
}

export class PatroliPageLoaded implements Action {
	readonly type = PatroliActionTypes.PatroliPageLoaded;
	constructor(public payload: { patroli: PatroliModel[], totalCount: number, page: QueryPatroliModel  }) { }
}


export class PatroliPageCancelled implements Action {
	readonly type = PatroliActionTypes.PatroliPageCancelled;
}

export class PatroliPageToggleLoading implements Action {
	readonly type = PatroliActionTypes.PatroliPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class PatroliActionToggleLoading implements Action {
	readonly type = PatroliActionTypes.PatroliActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type PatroliActions = PatroliCreated
	| PatroliUpdated
	| PatroliDeleted
	| PatroliOnServerCreated
	| PatroliPageLoaded
	| PatroliPageCancelled
	| PatroliPageToggleLoading
	| PatroliPageRequested
	| PatroliActionToggleLoading;
