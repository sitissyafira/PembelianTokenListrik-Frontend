// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { PrkbillingModel } from './prkbilling.model';
import { QueryPrkbillingModel } from './queryprkbilling.model';
// Models

export enum PrkbillingActionTypes {
	AllUsersRequested = '[Prkbilling Module] All Prkbilling Requested',
	AllUsersLoaded = '[Prkbilling API] All Prkbilling Loaded',
	PrkbillingOnServerCreated = '[Edit Prkbilling Component] Prkbilling On Server Created',
	PrkbillingCreated = '[Edit Prkbilling Dialog] Prkbilling Created',
	PrkbillingUpdated = '[Edit Prkbilling Dialog] Prkbilling Updated',
	PrkbillingDeleted = '[Prkbilling List Page] Prkbilling Deleted',
	PrkbillingPageRequested = '[Prkbilling List Page] Prkbilling Page Requested',
	PrkbillingPageLoaded = '[Prkbilling API] Prkbilling Page Loaded',
	PrkbillingPageCancelled = '[Prkbilling API] Prkbilling Page Cancelled',
	PrkbillingPageToggleLoading = '[Prkbilling] Prkbilling Page Toggle Loading',
	PrkbillingActionToggleLoading = '[Prkbilling] Prkbilling Action Toggle Loading'
}
export class PrkbillingOnServerCreated implements Action {
	readonly type = PrkbillingActionTypes.PrkbillingOnServerCreated;
	constructor(public payload: { prkbilling: PrkbillingModel }) { }
}

export class PrkbillingCreated implements Action {
	readonly type = PrkbillingActionTypes.PrkbillingCreated;
	constructor(public payload: { prkbilling: PrkbillingModel }) { }
}


export class PrkbillingUpdated implements Action {
	readonly type = PrkbillingActionTypes.PrkbillingUpdated;
	constructor(public payload: {
		partialPrkbilling: Update<PrkbillingModel>,
		prkbilling: PrkbillingModel
	}) { }
}

export class PrkbillingDeleted implements Action {
	readonly type = PrkbillingActionTypes.PrkbillingDeleted;

	constructor(public payload: { id: string }) {}
}

export class PrkbillingPageRequested implements Action {
	readonly type = PrkbillingActionTypes.PrkbillingPageRequested;
	constructor(public payload: { page: QueryPrkbillingModel }) { }
}

export class PrkbillingPageLoaded implements Action {
	readonly type = PrkbillingActionTypes.PrkbillingPageLoaded;
	constructor(public payload: { prkbilling: PrkbillingModel[], totalCount: number, page: QueryPrkbillingModel  }) { }
}


export class PrkbillingPageCancelled implements Action {
	readonly type = PrkbillingActionTypes.PrkbillingPageCancelled;
}

export class PrkbillingPageToggleLoading implements Action {
	readonly type = PrkbillingActionTypes.PrkbillingPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class PrkbillingActionToggleLoading implements Action {
	readonly type = PrkbillingActionTypes.PrkbillingActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type PrkbillingActions = PrkbillingCreated
	| PrkbillingUpdated
	| PrkbillingDeleted
	| PrkbillingOnServerCreated
	| PrkbillingPageLoaded
	| PrkbillingPageCancelled
	| PrkbillingPageToggleLoading
	| PrkbillingPageRequested
	| PrkbillingActionToggleLoading;
