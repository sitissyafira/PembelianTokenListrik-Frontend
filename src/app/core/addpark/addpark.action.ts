// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { AddparkModel } from './addpark.model';
import { QueryAddparkModel } from './queryaddpark.model';
// Models

export enum AddparkActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	AddparkOnServerCreated = '[Edit Addpark Component] Addpark On Server Created',
	AddparkCreated = '[Edit Addpark Dialog] Addpark Created',
	AddparkUpdated = '[Edit Addpark Dialog] Addpark Updated',
	AddparkDeleted = '[Addpark List Page] Addpark Deleted',
	AddparkPageRequested = '[Addpark List Page] Addpark Page Requested',
	AddparkPageLoaded = '[Addpark API] Addpark Page Loaded',
	AddparkPageCancelled = '[Addpark API] Addpark Page Cancelled',
	AddparkPageToggleLoading = '[Addpark] Addpark Page Toggle Loading',
	AddparkActionToggleLoading = '[Addpark] Addpark Action Toggle Loading'
}
export class AddparkOnServerCreated implements Action {
	readonly type = AddparkActionTypes.AddparkOnServerCreated;
	constructor(public payload: { addpark: AddparkModel }) { }
}

export class AddparkCreated implements Action {
	readonly type = AddparkActionTypes.AddparkCreated;
	constructor(public payload: { addpark: AddparkModel }) { }
}


export class AddparkUpdated implements Action {
	readonly type = AddparkActionTypes.AddparkUpdated;
	constructor(public payload: {
		partialAddpark: Update<AddparkModel>,
		addpark: AddparkModel
	}) { }
}

export class AddparkDeleted implements Action {
	readonly type = AddparkActionTypes.AddparkDeleted;

	constructor(public payload: { id: string }) {}
}

export class AddparkPageRequested implements Action {
	readonly type = AddparkActionTypes.AddparkPageRequested;
	constructor(public payload: { page: QueryAddparkModel }) { }
}

export class AddparkPageLoaded implements Action {
	readonly type = AddparkActionTypes.AddparkPageLoaded;
	constructor(public payload: { addpark: AddparkModel[], totalCount: number, page: QueryAddparkModel  }) { }
}


export class AddparkPageCancelled implements Action {
	readonly type = AddparkActionTypes.AddparkPageCancelled;
}

export class AddparkPageToggleLoading implements Action {
	readonly type = AddparkActionTypes.AddparkPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class AddparkActionToggleLoading implements Action {
	readonly type = AddparkActionTypes.AddparkActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type AddparkActions = AddparkCreated
	| AddparkUpdated
	| AddparkDeleted
	| AddparkOnServerCreated
	| AddparkPageLoaded
	| AddparkPageCancelled
	| AddparkPageToggleLoading
	| AddparkPageRequested
	| AddparkActionToggleLoading;
