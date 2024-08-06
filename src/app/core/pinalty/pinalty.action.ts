// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { PinaltyModel} from './pinalty.model';
// Models
import {QueryParamsModel} from '../_base/crud/models/query-models/query-params.model';

export enum PinaltyActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	PinaltyOnServerCreated = '[Edit Pinalty Component] Pinalty On Server Created',
	PinaltyCreated = '[Edit Pinalty Dialog] Pinalty Created',
	PinaltyUpdated = '[Edit Pinalty Dialog] Pinalty Updated',
	PinaltyDeleted = '[Pinalty List Page] Pinalty Deleted',
	PinaltyPageRequested = '[Pinalty List Page] Pinalty Page Requested',
	PinaltyPageLoaded = '[Pinalty API] Pinalty Page Loaded',
	PinaltyPageCancelled = '[Pinalty API] Pinalty Page Cancelled',
	PinaltyPageToggleLoading = '[Pinalty] Pinalty Page Toggle Loading',
	PinaltyActionToggleLoading = '[Pinalty] Pinalty Action Toggle Loading'
}
export class PinaltyOnServerCreated implements Action {
	readonly type = PinaltyActionTypes.PinaltyOnServerCreated;
	constructor(public payload: { pinalty: PinaltyModel }) { }
}

export class PinaltyCreated implements Action {
	readonly type = PinaltyActionTypes.PinaltyCreated;
	constructor(public payload: { pinalty: PinaltyModel }) { }
}


export class PinaltyUpdated implements Action {
	readonly type = PinaltyActionTypes.PinaltyUpdated;
	constructor(public payload: {
		partialPinalty: Update<PinaltyModel>,
		pinalty: PinaltyModel
	}) { }
}

export class PinaltyDeleted implements Action {
	readonly type = PinaltyActionTypes.PinaltyDeleted;

	constructor(public payload: { id: string }) {}
}

export class PinaltyPageRequested implements Action {
	readonly type = PinaltyActionTypes.PinaltyPageRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class PinaltyPageLoaded implements Action {
	readonly type = PinaltyActionTypes.PinaltyPageLoaded;
	constructor(public payload: { pinalty: PinaltyModel[], totalCount: number, page: QueryParamsModel  }) { }
}


export class PinaltyPageCancelled implements Action {
	readonly type = PinaltyActionTypes.PinaltyPageCancelled;
}

export class PinaltyPageToggleLoading implements Action {
	readonly type = PinaltyActionTypes.PinaltyPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class PinaltyActionToggleLoading implements Action {
	readonly type = PinaltyActionTypes.PinaltyActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type PinaltyActions = PinaltyCreated
	| PinaltyUpdated
	| PinaltyDeleted
	| PinaltyOnServerCreated
	| PinaltyPageLoaded
	| PinaltyPageCancelled
	| PinaltyPageToggleLoading
	| PinaltyPageRequested
	| PinaltyActionToggleLoading;
