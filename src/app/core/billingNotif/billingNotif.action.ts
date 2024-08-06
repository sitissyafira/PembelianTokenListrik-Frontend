// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { billingNotifModel } from './billingNotif.model';
import { QuerybillingNotifModel } from './queryag.model';
// Models

export enum billingNotifActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	billingNotifOnServerCreated = '[Edit billingNotif Component] billingNotif On Server Created',
	billingNotifCreated = '[Edit billingNotif Dialog] billingNotif Created',
	billingNotifUpdated = '[Edit billingNotif Dialog] billingNotif Updated',
	billingNotifDeleted = '[billingNotif List Page] billingNotif Deleted',
	billingNotifPageRequested = '[billingNotif List Page] billingNotif Page Requested',
	billingNotifPageLoaded = '[billingNotif API] billingNotif Page Loaded',
	billingNotifPageCancelled = '[billingNotif API] billingNotif Page Cancelled',
	billingNotifPageToggleLoading = '[billingNotif] billingNotif Page Toggle Loading',
	billingNotifActionToggleLoading = '[billingNotif] billingNotif Action Toggle Loading'
}
export class billingNotifOnServerCreated implements Action {
	readonly type = billingNotifActionTypes.billingNotifOnServerCreated;
	constructor(public payload: { billingNotif: billingNotifModel }) { }
}

export class billingNotifCreated implements Action {
	readonly type = billingNotifActionTypes.billingNotifCreated;
	constructor(public payload: { billingNotif: billingNotifModel }) { }
}


export class billingNotifUpdated implements Action {
	readonly type = billingNotifActionTypes.billingNotifUpdated;
	constructor(public payload: {
		partialbillingNotif: Update<billingNotifModel>,
		billingNotif: billingNotifModel
	}) { }
}

export class billingNotifDeleted implements Action {
	readonly type = billingNotifActionTypes.billingNotifDeleted;

	constructor(public payload: { id: string }) {}
}

export class billingNotifPageRequested implements Action {
	readonly type = billingNotifActionTypes.billingNotifPageRequested;
	constructor(public payload: { page: QuerybillingNotifModel }) { }
}

export class billingNotifPageLoaded implements Action {
	readonly type = billingNotifActionTypes.billingNotifPageLoaded;
	constructor(public payload: { billingNotif: billingNotifModel[], totalCount: number, page: QuerybillingNotifModel  }) { }
}


export class billingNotifPageCancelled implements Action {
	readonly type = billingNotifActionTypes.billingNotifPageCancelled;
}

export class billingNotifPageToggleLoading implements Action {
	readonly type = billingNotifActionTypes.billingNotifPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class billingNotifActionToggleLoading implements Action {
	readonly type = billingNotifActionTypes.billingNotifActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type billingNotifActions = billingNotifCreated
	| billingNotifUpdated
	| billingNotifDeleted
	| billingNotifOnServerCreated
	| billingNotifPageLoaded
	| billingNotifPageCancelled
	| billingNotifPageToggleLoading
	| billingNotifPageRequested
	| billingNotifActionToggleLoading;
