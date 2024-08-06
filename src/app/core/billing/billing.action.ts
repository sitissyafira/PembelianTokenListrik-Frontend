import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import {BillingModel} from './billing.model';
// Models
import { QueryBillingModel } from './querybilling.model';


export enum BillingActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	BillingOnServerCreated = '[Edit Billing Component] Billing On Server Created',
	BillingCreated = '[Edit Billing Dialog] Billing Created',
	BillingUpdated = '[Edit Billing Dialog] Billing Updated',
	BillingDeleted = '[Billing List Page] Billing Deleted',
	BillingPageRequested = '[Billing List Page] Billing Page Requested',
	BillingPageRequestedLog = '[BillingLog ListLog Page] BillingLog Page Requested',
	BillingPageLoaded = '[Billing API] Billing Page Loaded',
	BillingPageCancelled = '[Billing API] Billing Page Cancelled',
	BillingPageToggleLoading = '[Billing] Billing Page Toggle Loading',
	BillingActionToggleLoading = '[Billing] Billing Action Toggle Loading'
}

export class BillingOnServerCreated implements Action {
	readonly type = BillingActionTypes.BillingOnServerCreated;
	constructor(public payload: {billing: BillingModel }) { }
}

export class BillingCreated implements Action {
	readonly type = BillingActionTypes.BillingCreated;
	constructor(public payload: {billing: BillingModel }) { }
}

export class BillingUpdated implements Action {
	readonly type = BillingActionTypes.BillingUpdated;
	constructor(public payload: {
		partialBilling: Update<BillingModel>,
		billing: BillingModel
	}) { }
}

export class BillingDeleted implements Action {
	readonly type = BillingActionTypes.BillingDeleted;
	constructor(public payload: { id: string }) { }
}

export class BillingPageRequested implements Action {
	readonly type = BillingActionTypes.BillingPageRequested;
	constructor(public payload: { page: QueryBillingModel }) { }
}

export class BillingPageRequestedLog implements Action {
	readonly type = BillingActionTypes.BillingPageRequestedLog;
	constructor(public payload: { page: QueryBillingModel }) { }
}

export class BillingPageLoaded implements Action {
	readonly type = BillingActionTypes.BillingPageLoaded;
	constructor(public payload: { billing: BillingModel[], totalCount: number, page: QueryBillingModel  }) { }
}


export class BillingPageCancelled implements Action {
	readonly type = BillingActionTypes.BillingPageCancelled;
}

export class BillingPageToggleLoading implements Action {
	readonly type = BillingActionTypes.BillingPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class BillingActionToggleLoading implements Action {
	readonly type = BillingActionTypes.BillingActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type BillingActions = BillingCreated
	| BillingUpdated
	| BillingDeleted
	| BillingOnServerCreated
	| BillingPageLoaded
	| BillingPageCancelled
	| BillingPageToggleLoading
	| BillingPageRequested
	| BillingActionToggleLoading
