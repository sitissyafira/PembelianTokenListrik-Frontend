// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { SubdefectModel } from './subdefect.model';
import { QuerySubdefectModel } from './querysubdefect.model';
// Models

export enum SubdefectActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	SubdefectOnServerCreated = '[Edit Subdefect Component] Subdefect On Server Created',
	SubdefectCreated = '[Edit Subdefect Dialog] Subdefect Created',
	SubdefectUpdated = '[Edit Subdefect Dialog] Subdefect Updated',
	SubdefectDeleted = '[Subdefect List Page] Subdefect Deleted',
	SubdefectPageRequested = '[Subdefect List Page] Subdefect Page Requested',
	SubdefectPageLoaded = '[Subdefect API] Subdefect Page Loaded',
	SubdefectPageCancelled = '[Subdefect API] Subdefect Page Cancelled',
	SubdefectPageToggleLoading = '[Subdefect] Subdefect Page Toggle Loading',
	SubdefectActionToggleLoading = '[Subdefect] Subdefect Action Toggle Loading'
}
export class SubdefectOnServerCreated implements Action {
	readonly type = SubdefectActionTypes.SubdefectOnServerCreated;
	constructor(public payload: { subdefect: SubdefectModel }) { }
}

export class SubdefectCreated implements Action {
	readonly type = SubdefectActionTypes.SubdefectCreated;
	constructor(public payload: { subdefect: SubdefectModel }) { }
}


export class SubdefectUpdated implements Action {
	readonly type = SubdefectActionTypes.SubdefectUpdated;
	constructor(public payload: {
		partialSubdefect: Update<SubdefectModel>,
		subdefect: SubdefectModel
	}) { }
}

export class SubdefectDeleted implements Action {
	readonly type = SubdefectActionTypes.SubdefectDeleted;

	constructor(public payload: { id: string }) {}
}

export class SubdefectPageRequested implements Action {
	readonly type = SubdefectActionTypes.SubdefectPageRequested;
	constructor(public payload: { page: QuerySubdefectModel }) { }
}

export class SubdefectPageLoaded implements Action {
	readonly type = SubdefectActionTypes.SubdefectPageLoaded;
	constructor(public payload: { subdefect: SubdefectModel[], totalCount: number, page: QuerySubdefectModel  }) { }
}


export class SubdefectPageCancelled implements Action {
	readonly type = SubdefectActionTypes.SubdefectPageCancelled;
}

export class SubdefectPageToggleLoading implements Action {
	readonly type = SubdefectActionTypes.SubdefectPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class SubdefectActionToggleLoading implements Action {
	readonly type = SubdefectActionTypes.SubdefectActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type SubdefectActions = SubdefectCreated
	| SubdefectUpdated
	| SubdefectDeleted
	| SubdefectOnServerCreated
	| SubdefectPageLoaded
	| SubdefectPageCancelled
	| SubdefectPageToggleLoading
	| SubdefectPageRequested
	| SubdefectActionToggleLoading;
