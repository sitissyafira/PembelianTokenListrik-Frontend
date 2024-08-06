// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { ShiftModel } from './shift.model';
import { QueryShiftModel } from './queryshift.model';
// Models

export enum ShiftActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	ShiftOnServerCreated = '[Edit Shift Component] Shift On Server Created',
	ShiftCreated = '[Edit Shift Dialog] Shift Created',
	ShiftUpdated = '[Edit Shift Dialog] Shift Updated',
	ShiftDeleted = '[Shift List Page] Shift Deleted',
	ShiftPageRequested = '[Shift List Page] Shift Page Requested',
	ShiftPageLoaded = '[Shift API] Shift Page Loaded',
	ShiftPageCancelled = '[Shift API] Shift Page Cancelled',
	ShiftPageToggleLoading = '[Shift] Shift Page Toggle Loading',
	ShiftActionToggleLoading = '[Shift] Shift Action Toggle Loading'
}
export class ShiftOnServerCreated implements Action {
	readonly type = ShiftActionTypes.ShiftOnServerCreated;
	constructor(public payload: { shift: ShiftModel }) { }
}

export class ShiftCreated implements Action {
	readonly type = ShiftActionTypes.ShiftCreated;
	constructor(public payload: { shift: ShiftModel }) { }
}


export class ShiftUpdated implements Action {
	readonly type = ShiftActionTypes.ShiftUpdated;
	constructor(public payload: {
		partialShift: Update<ShiftModel>,
		shift: ShiftModel
	}) { }
}

export class ShiftDeleted implements Action {
	readonly type = ShiftActionTypes.ShiftDeleted;

	constructor(public payload: { id: string }) {}
}

export class ShiftPageRequested implements Action {
	readonly type = ShiftActionTypes.ShiftPageRequested;
	constructor(public payload: { page: QueryShiftModel }) { }
}

export class ShiftPageLoaded implements Action {
	readonly type = ShiftActionTypes.ShiftPageLoaded;
	constructor(public payload: { shift: ShiftModel[], totalCount: number, page: QueryShiftModel  }) { }
}


export class ShiftPageCancelled implements Action {
	readonly type = ShiftActionTypes.ShiftPageCancelled;
}

export class ShiftPageToggleLoading implements Action {
	readonly type = ShiftActionTypes.ShiftPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class ShiftActionToggleLoading implements Action {
	readonly type = ShiftActionTypes.ShiftActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type ShiftActions = ShiftCreated
	| ShiftUpdated
	| ShiftDeleted
	| ShiftOnServerCreated
	| ShiftPageLoaded
	| ShiftPageCancelled
	| ShiftPageToggleLoading
	| ShiftPageRequested
	| ShiftActionToggleLoading;
