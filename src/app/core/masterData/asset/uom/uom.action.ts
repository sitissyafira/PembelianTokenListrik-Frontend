// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { UomModel } from './uom.model';
import { QueryUomModel } from './queryuom.model';
// Models

export enum UomActionTypes {
	AllUsersRequested = '[Uom Module] All Uom Requested',
	AllUsersLoaded = '[Uom API] All Uom Loaded',
	UomOnServerCreated = '[Edit Uom Component] Uom On Server Created',
	UomCreated = '[Edit Uom Dialog] Uom Created',
	UomUpdated = '[Edit Uom Dialog] Uom Updated',
	UomDeleted = '[Uom List Page] Uom Deleted',
	UomPageRequested = '[Uom List Page] Uom Page Requested',
	UomPageLoaded = '[Uom API] Uom Page Loaded',
	UomPageCancelled = '[Uom API] Uom Page Cancelled',
	UomPageToggleLoading = '[Uom] Uom Page Toggle Loading',
	UomActionToggleLoading = '[Uom] Uom Action Toggle Loading'
}
export class UomOnServerCreated implements Action {
	readonly type = UomActionTypes.UomOnServerCreated;
	constructor(public payload: { uom: UomModel }) { }
}

export class UomCreated implements Action {
	readonly type = UomActionTypes.UomCreated;
	constructor(public payload: { uom: UomModel }) { }
}


export class UomUpdated implements Action {
	readonly type = UomActionTypes.UomUpdated;
	constructor(public payload: {
		partialUom: Update<UomModel>,
		uom: UomModel
	}) { }
}

export class UomDeleted implements Action {
	readonly type = UomActionTypes.UomDeleted;

	constructor(public payload: { id: string }) {}
}

export class UomPageRequested implements Action {
	readonly type = UomActionTypes.UomPageRequested;
	constructor(public payload: { page: QueryUomModel }) { }
}

export class UomPageLoaded implements Action {
	readonly type = UomActionTypes.UomPageLoaded;
	constructor(public payload: { uom: UomModel[], totalCount: number, page: QueryUomModel  }) { }
}


export class UomPageCancelled implements Action {
	readonly type = UomActionTypes.UomPageCancelled;
}

export class UomPageToggleLoading implements Action {
	readonly type = UomActionTypes.UomPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class UomActionToggleLoading implements Action {
	readonly type = UomActionTypes.UomActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type UomActions = UomCreated
	| UomUpdated
	| UomDeleted
	| UomOnServerCreated
	| UomPageLoaded
	| UomPageCancelled
	| UomPageToggleLoading
	| UomPageRequested
	| UomActionToggleLoading;
