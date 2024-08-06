// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { DefectModel } from './defect.model';
import { QueryDefectModel } from './querydefect.model';
// Models

export enum DefectActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	DefectOnServerCreated = '[Edit Defect Component] Defect On Server Created',
	DefectCreated = '[Edit Defect Dialog] Defect Created',
	DefectUpdated = '[Edit Defect Dialog] Defect Updated',
	DefectDeleted = '[Defect List Page] Defect Deleted',
	DefectPageRequested = '[Defect List Page] Defect Page Requested',
	DefectPageLoaded = '[Defect API] Defect Page Loaded',
	DefectPageCancelled = '[Defect API] Defect Page Cancelled',
	DefectPageToggleLoading = '[Defect] Defect Page Toggle Loading',
	DefectActionToggleLoading = '[Defect] Defect Action Toggle Loading'
}
export class DefectOnServerCreated implements Action {
	readonly type = DefectActionTypes.DefectOnServerCreated;
	constructor(public payload: { defect: DefectModel }) { }
}

export class DefectCreated implements Action {
	readonly type = DefectActionTypes.DefectCreated;
	constructor(public payload: { defect: DefectModel }) { }
}


export class DefectUpdated implements Action {
	readonly type = DefectActionTypes.DefectUpdated;
	constructor(public payload: {
		partialDefect: Update<DefectModel>,
		defect: DefectModel
	}) { }
}

export class DefectDeleted implements Action {
	readonly type = DefectActionTypes.DefectDeleted;

	constructor(public payload: { id: string }) {}
}

export class DefectPageRequested implements Action {
	readonly type = DefectActionTypes.DefectPageRequested;
	constructor(public payload: { page: QueryDefectModel }) { }
}

export class DefectPageLoaded implements Action {
	readonly type = DefectActionTypes.DefectPageLoaded;
	constructor(public payload: { defect: DefectModel[], totalCount: number, page: QueryDefectModel  }) { }
}


export class DefectPageCancelled implements Action {
	readonly type = DefectActionTypes.DefectPageCancelled;
}

export class DefectPageToggleLoading implements Action {
	readonly type = DefectActionTypes.DefectPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class DefectActionToggleLoading implements Action {
	readonly type = DefectActionTypes.DefectActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type DefectActions = DefectCreated
	| DefectUpdated
	| DefectDeleted
	| DefectOnServerCreated
	| DefectPageLoaded
	| DefectPageCancelled
	| DefectPageToggleLoading
	| DefectPageRequested
	| DefectActionToggleLoading;
