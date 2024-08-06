// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { RentalbillingModel } from './rentalbilling.model';
import { QueryRentalbillingModel } from './queryrentalbilling.model';
// Models

export enum RentalbillingActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	RentalbillingOnServerCreated = '[Edit Rentalbilling Component] Rentalbilling On Server Created',
	RentalbillingCreated = '[Edit Rentalbilling Dialog] Rentalbilling Created',
	RentalbillingUpdated = '[Edit Rentalbilling Dialog] Rentalbilling Updated',
	RentalbillingDeleted = '[Rentalbilling List Page] Rentalbilling Deleted',
	RentalbillingPageRequested = '[Rentalbilling List Page] Rentalbilling Page Requested',
	RentalbillingPageLoaded = '[Rentalbilling API] Rentalbilling Page Loaded',
	RentalbillingPageCancelled = '[Rentalbilling API] Rentalbilling Page Cancelled',
	RentalbillingPageToggleLoading = '[Rentalbilling] Rentalbilling Page Toggle Loading',
	RentalbillingActionToggleLoading = '[Rentalbilling] Rentalbilling Action Toggle Loading'
}
export class RentalbillingOnServerCreated implements Action {
	readonly type = RentalbillingActionTypes.RentalbillingOnServerCreated;
	constructor(public payload: { rentalbilling: RentalbillingModel }) { }
}

export class RentalbillingCreated implements Action {
	readonly type = RentalbillingActionTypes.RentalbillingCreated;
	constructor(public payload: { rentalbilling: RentalbillingModel }) { }
}


export class RentalbillingUpdated implements Action {
	readonly type = RentalbillingActionTypes.RentalbillingUpdated;
	constructor(public payload: {
		partialRentalbilling: Update<RentalbillingModel>,
		rentalbilling: RentalbillingModel
	}) { }
}

export class RentalbillingDeleted implements Action {
	readonly type = RentalbillingActionTypes.RentalbillingDeleted;

	constructor(public payload: { id: string }) {}
}

export class RentalbillingPageRequested implements Action {
	readonly type = RentalbillingActionTypes.RentalbillingPageRequested;
	constructor(public payload: { page: QueryRentalbillingModel }) { }
}

export class RentalbillingPageLoaded implements Action {
	readonly type = RentalbillingActionTypes.RentalbillingPageLoaded;
	constructor(public payload: { rentalbilling: RentalbillingModel[], totalCount: number, page: QueryRentalbillingModel  }) { }
}


export class RentalbillingPageCancelled implements Action {
	readonly type = RentalbillingActionTypes.RentalbillingPageCancelled;
}

export class RentalbillingPageToggleLoading implements Action {
	readonly type = RentalbillingActionTypes.RentalbillingPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class RentalbillingActionToggleLoading implements Action {
	readonly type = RentalbillingActionTypes.RentalbillingActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type RentalbillingActions = RentalbillingCreated
	| RentalbillingUpdated
	| RentalbillingDeleted
	| RentalbillingOnServerCreated
	| RentalbillingPageLoaded
	| RentalbillingPageCancelled
	| RentalbillingPageToggleLoading
	| RentalbillingPageRequested
	| RentalbillingActionToggleLoading;
