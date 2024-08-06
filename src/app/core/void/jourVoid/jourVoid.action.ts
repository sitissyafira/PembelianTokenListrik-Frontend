// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { JourVoidModel } from './jourVoid.model';
// Models
import { QueryJourVoidModel } from './queryjourVoid.model';

export enum JourVoidActionTypes {
	AllUsersRequested = '[JourVoid Module] All JourVoid Requested',
	AllUsersLoaded = '[JourVoid API] All JourVoid Loaded',
	JourVoidOnServerCreated = '[Edit JourVoid Component] JourVoid On Server Created',
	JourVoidCreated = '[Edit JourVoid Dialog] JourVoid Created',
	JourVoidUpdated = '[Edit JourVoid Dialog] JourVoid Updated',
	JourVoidDeleted = '[JourVoid List Page] JourVoid Deleted',
	JourVoidPageRequested = '[JourVoid List Page] JourVoid Page Requested',
	JourVoidPageLoaded = '[JourVoid API] JourVoid Page Loaded',
	JourVoidPageCancelled = '[JourVoid API] JourVoid Page Cancelled',
	JourVoidPageToggleLoading = '[JourVoid] JourVoid Page Toggle Loading',
	JourVoidActionToggleLoading = '[JourVoid] JourVoid Action Toggle Loading'
}
export class JourVoidOnServerCreated implements Action {
	readonly type = JourVoidActionTypes.JourVoidOnServerCreated;
	constructor(public payload: { jourVoid: JourVoidModel }) { }
}

export class JourVoidCreated implements Action {
	readonly type = JourVoidActionTypes.JourVoidCreated;
	constructor(public payload: { jourVoid: JourVoidModel }) { }
}


export class JourVoidUpdated implements Action {
	readonly type = JourVoidActionTypes.JourVoidUpdated;
	constructor(public payload: {
		partialJourVoid: Update<JourVoidModel>,
		jourVoid: JourVoidModel
	}) { }
}

export class JourVoidDeleted implements Action {
	readonly type = JourVoidActionTypes.JourVoidDeleted;

	constructor(public payload: { id: string }) { }
}

export class JourVoidPageRequested implements Action {
	readonly type = JourVoidActionTypes.JourVoidPageRequested;
	constructor(public payload: { page: QueryJourVoidModel }) { }
}

export class JourVoidPageLoaded implements Action {
	readonly type = JourVoidActionTypes.JourVoidPageLoaded;
	constructor(public payload: { jourVoid: JourVoidModel[], totalCount: number, page: QueryJourVoidModel }) { }
}


export class JourVoidPageCancelled implements Action {
	readonly type = JourVoidActionTypes.JourVoidPageCancelled;
}

export class JourVoidPageToggleLoading implements Action {
	readonly type = JourVoidActionTypes.JourVoidPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class JourVoidActionToggleLoading implements Action {
	readonly type = JourVoidActionTypes.JourVoidActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type JourVoidActions = JourVoidCreated
	| JourVoidUpdated
	| JourVoidDeleted
	| JourVoidOnServerCreated
	| JourVoidPageLoaded
	| JourVoidPageCancelled
	| JourVoidPageToggleLoading
	| JourVoidPageRequested
	| JourVoidActionToggleLoading;
