// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { DebitNoteModel } from './debitNote.model';
import { QueryDebitNoteModel } from './querydebitNote.model';
// Models

export enum DebitNoteActionTypes {
	AllUsersRequested = '[DebitNote Module] All DebitNote Requested',
	AllUsersLoaded = '[DebitNote API] All DebitNote Loaded',
	DebitNoteOnServerCreated = '[Edit DebitNote Component] DebitNote On Server Created',
	DebitNoteCreated = '[Edit DebitNote Dialog] DebitNote Created',
	DebitNoteUpdated = '[Edit DebitNote Dialog] DebitNote Updated',
	DebitNoteDeleted = '[DebitNote List Page] DebitNote Deleted',
	DebitNotePageRequested = '[DebitNote List Page] DebitNote Page Requested',
	DebitNotePageLoaded = '[DebitNote API] DebitNote Page Loaded',
	DebitNotePageCancelled = '[DebitNote API] DebitNote Page Cancelled',
	DebitNotePageToggleLoading = '[DebitNote] DebitNote Page Toggle Loading',
	DebitNoteActionToggleLoading = '[DebitNote] DebitNote Action Toggle Loading'
}
export class DebitNoteOnServerCreated implements Action {
	readonly type = DebitNoteActionTypes.DebitNoteOnServerCreated;
	constructor(public payload: { debitNote: DebitNoteModel }) { }
}

export class DebitNoteCreated implements Action {
	readonly type = DebitNoteActionTypes.DebitNoteCreated;
	constructor(public payload: { debitNote: DebitNoteModel }) { }
}


export class DebitNoteUpdated implements Action {
	readonly type = DebitNoteActionTypes.DebitNoteUpdated;
	constructor(public payload: {
		pdebitNotetialDebitNote: Update<DebitNoteModel>,
		debitNote: DebitNoteModel
	}) { }
}

export class DebitNoteDeleted implements Action {
	readonly type = DebitNoteActionTypes.DebitNoteDeleted;

	constructor(public payload: { id: string }) { }
}

export class DebitNotePageRequested implements Action {
	readonly type = DebitNoteActionTypes.DebitNotePageRequested;
	constructor(public payload: { page: QueryDebitNoteModel }) { }
}

export class DebitNotePageLoaded implements Action {
	readonly type = DebitNoteActionTypes.DebitNotePageLoaded;
	constructor(public payload: { debitNote: DebitNoteModel[], totalCount: number, page: QueryDebitNoteModel }) { }
}


export class DebitNotePageCancelled implements Action {
	readonly type = DebitNoteActionTypes.DebitNotePageCancelled;
}

export class DebitNotePageToggleLoading implements Action {
	readonly type = DebitNoteActionTypes.DebitNotePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class DebitNoteActionToggleLoading implements Action {
	readonly type = DebitNoteActionTypes.DebitNoteActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type DebitNoteActions = DebitNoteCreated
	| DebitNoteUpdated
	| DebitNoteDeleted
	| DebitNoteOnServerCreated
	| DebitNotePageLoaded
	| DebitNotePageCancelled
	| DebitNotePageToggleLoading
	| DebitNotePageRequested
	| DebitNoteActionToggleLoading;
