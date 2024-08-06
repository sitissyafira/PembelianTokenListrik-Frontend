// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { RenterModel } from './renter.model';
import { QueryRenterModel } from './queryrenter.model';
// Models

export enum RenterActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	RenterOnServerCreated = '[Edit Renter Component] Renter On Server Created',
	RenterCreated = '[Edit Renter Dialog] Renter Created',
	RenterUpdated = '[Edit Renter Dialog] Renter Updated',
	RenterDeleted = '[Renter List Page] Renter Deleted',
	RenterPageRequested = '[Renter List Page] Renter Page Requested',
	RenterPageLoaded = '[Renter API] Renter Page Loaded',
	RenterPageCancelled = '[Renter API] Renter Page Cancelled',
	RenterPageToggleLoading = '[Renter] Renter Page Toggle Loading',
	RenterActionToggleLoading = '[Renter] Renter Action Toggle Loading'
}
export class RenterOnServerCreated implements Action {
	readonly type = RenterActionTypes.RenterOnServerCreated;
	constructor(public payload: { renter: RenterModel }) { }
}

export class RenterCreated implements Action {
	readonly type = RenterActionTypes.RenterCreated;
	constructor(public payload: { renter: RenterModel }) { }
}


export class RenterUpdated implements Action {
	readonly type = RenterActionTypes.RenterUpdated;
	constructor(public payload: {
		partialRenter: Update<RenterModel>,
		renter: RenterModel
	}) { }
}

export class RenterDeleted implements Action {
	readonly type = RenterActionTypes.RenterDeleted;

	constructor(public payload: { id: string }) { }
}

export class RenterPageRequested implements Action {
	readonly type = RenterActionTypes.RenterPageRequested;
	constructor(public payload: { page: QueryRenterModel }) { }
}

export class RenterPageLoaded implements Action {
	readonly type = RenterActionTypes.RenterPageLoaded;
	constructor(public payload: { renter: RenterModel[], totalCount: number, page: QueryRenterModel }) { }
}


export class RenterPageCancelled implements Action {
	readonly type = RenterActionTypes.RenterPageCancelled;
}

export class RenterPageToggleLoading implements Action {
	readonly type = RenterActionTypes.RenterPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class RenterActionToggleLoading implements Action {
	readonly type = RenterActionTypes.RenterActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type RenterActions = RenterCreated
	| RenterUpdated
	| RenterDeleted
	| RenterOnServerCreated
	| RenterPageLoaded
	| RenterPageCancelled
	| RenterPageToggleLoading
	| RenterPageRequested
	| RenterActionToggleLoading;
