// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { VisitorModel } from './visitor.model';
import { QueryVisitorModel } from './queryvisitor.model';
// Models

export enum VisitorActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	VisitorOnServerCreated = '[Edit Visitor Component] Visitor On Server Created',
	VisitorCreated = '[Edit Visitor Dialog] Visitor Created',
	VisitorUpdated = '[Edit Visitor Dialog] Visitor Updated',
	VisitorDeleted = '[Visitor List Page] Visitor Deleted',
	VisitorPageRequested = '[Visitor List Page] Visitor Page Requested',
	VisitorPageLoaded = '[Visitor API] Visitor Page Loaded',
	VisitorPageCancelled = '[Visitor API] Visitor Page Cancelled',
	VisitorPageToggleLoading = '[Visitor] Visitor Page Toggle Loading',
	VisitorActionToggleLoading = '[Visitor] Visitor Action Toggle Loading'
}
export class VisitorOnServerCreated implements Action {
	readonly type = VisitorActionTypes.VisitorOnServerCreated;
	constructor(public payload: { visitor: VisitorModel }) { }
}

export class VisitorCreated implements Action {
	readonly type = VisitorActionTypes.VisitorCreated;
	constructor(public payload: { visitor: VisitorModel }) { }
}


export class VisitorUpdated implements Action {
	readonly type = VisitorActionTypes.VisitorUpdated;
	constructor(public payload: {
		partialVisitor: Update<VisitorModel>,
		visitor: VisitorModel
	}) { }
}

export class VisitorDeleted implements Action {
	readonly type = VisitorActionTypes.VisitorDeleted;

	constructor(public payload: { id: string }) {}
}

export class VisitorPageRequested implements Action {
	readonly type = VisitorActionTypes.VisitorPageRequested;
	constructor(public payload: { page: QueryVisitorModel }) { }
}

export class VisitorPageLoaded implements Action {
	readonly type = VisitorActionTypes.VisitorPageLoaded;
	constructor(public payload: { visitor: VisitorModel[], totalCount: number, page: QueryVisitorModel  }) { }
}


export class VisitorPageCancelled implements Action {
	readonly type = VisitorActionTypes.VisitorPageCancelled;
}

export class VisitorPageToggleLoading implements Action {
	readonly type = VisitorActionTypes.VisitorPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class VisitorActionToggleLoading implements Action {
	readonly type = VisitorActionTypes.VisitorActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type VisitorActions = VisitorCreated
	| VisitorUpdated
	| VisitorDeleted
	| VisitorOnServerCreated
	| VisitorPageLoaded
	| VisitorPageCancelled
	| VisitorPageToggleLoading
	| VisitorPageRequested
	| VisitorActionToggleLoading;
