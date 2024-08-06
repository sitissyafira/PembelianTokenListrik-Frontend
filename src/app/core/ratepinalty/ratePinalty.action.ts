// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { RatePinaltyModel } from './ratePinalty.model';
import { QueryPinaltyModel } from './querypinalty.model';
// Models

export enum RatePinaltyActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	RatePinaltyOnServerCreated = '[Edit RatePinalty Component] RatePinalty On Server Created',
	RatePinaltyCreated = '[Edit RatePinalty Dialog] RatePinalty Created',
	RatePinaltyUpdated = '[Edit RatePinalty Dialog] RatePinalty Updated',
	RatePinaltyDeleted = '[RatePinalty List Page] RatePinalty Deleted',
	RatePinaltyPageRequested = '[RatePinalty List Page] RatePinalty Page Requested',
	RatePinaltyPageLoaded = '[RatePinalty API] RatePinalty Page Loaded',
	RatePinaltyPageCancelled = '[RatePinalty API] RatePinalty Page Cancelled',
	RatePinaltyPageToggleLoading = '[RatePinalty] RatePinalty Page Toggle Loading',
	RatePinaltyActionToggleLoading = '[RatePinalty] RatePinalty Action Toggle Loading'
}
export class RatePinaltyOnServerCreated implements Action {
	readonly type = RatePinaltyActionTypes.RatePinaltyOnServerCreated;
	constructor(public payload: { ratePinalty: RatePinaltyModel }) { }
}

export class RatePinaltyCreated implements Action {
	readonly type = RatePinaltyActionTypes.RatePinaltyCreated;
	constructor(public payload: { ratePinalty: RatePinaltyModel }) { }
}


export class RatePinaltyUpdated implements Action {
	readonly type = RatePinaltyActionTypes.RatePinaltyUpdated;
	constructor(public payload: {
		partialRatePinalty: Update<RatePinaltyModel>,
		ratePinalty: RatePinaltyModel
	}) { }
}

export class RatePinaltyDeleted implements Action {
	readonly type = RatePinaltyActionTypes.RatePinaltyDeleted;

	constructor(public payload: { id: string }) {}
}

export class RatePinaltyPageRequested implements Action {
	readonly type = RatePinaltyActionTypes.RatePinaltyPageRequested;
	constructor(public payload: { page: QueryPinaltyModel }) { }
}

export class RatePinaltyPageLoaded implements Action {
	readonly type = RatePinaltyActionTypes.RatePinaltyPageLoaded;
	constructor(public payload: { ratePinalty: RatePinaltyModel[], totalCount: number, page: QueryPinaltyModel  }) { }
}


export class RatePinaltyPageCancelled implements Action {
	readonly type = RatePinaltyActionTypes.RatePinaltyPageCancelled;
}

export class RatePinaltyPageToggleLoading implements Action {
	readonly type = RatePinaltyActionTypes.RatePinaltyPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class RatePinaltyActionToggleLoading implements Action {
	readonly type = RatePinaltyActionTypes.RatePinaltyActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type RatePinaltyActions = RatePinaltyCreated
	| RatePinaltyUpdated
	| RatePinaltyDeleted
	| RatePinaltyOnServerCreated
	| RatePinaltyPageLoaded
	| RatePinaltyPageCancelled
	| RatePinaltyPageToggleLoading
	| RatePinaltyPageRequested
	| RatePinaltyActionToggleLoading;
