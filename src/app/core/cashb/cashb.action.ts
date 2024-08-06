// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { CashbModel } from './cashb.model';
import { QueryCashbModel } from './queryb.model';
// Models

export enum CashbActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	CashbOnServerCreated = '[Edit Cashb Component] Cashb On Server Created',
	CashbCreated = '[Edit Cashb Dialog] Cashb Created',
	CashbUpdated = '[Edit Cashb Dialog] Cashb Updated',
	CashbDeleted = '[Cashb List Page] Cashb Deleted',
	CashbPageRequested = '[Cashb List Page] Cashb Page Requested',
	CashbPageLoaded = '[Cashb API] Cashb Page Loaded',
	CashbPageCancelled = '[Cashb API] Cashb Page Cancelled',
	CashbPageToggleLoading = '[Cashb] Cashb Page Toggle Loading',
	CashbActionToggleLoading = '[Cashb] Cashb Action Toggle Loading'
}
export class CashbOnServerCreated implements Action {
	readonly type = CashbActionTypes.CashbOnServerCreated;
	constructor(public payload: { cashb: CashbModel }) { }
}

export class CashbCreated implements Action {
	readonly type = CashbActionTypes.CashbCreated;
	constructor(public payload: { cashb: CashbModel }) { }
}


export class CashbUpdated implements Action {
	readonly type = CashbActionTypes.CashbUpdated;
	constructor(public payload: {
		partialCashb: Update<CashbModel>,
		cashb: CashbModel
	}) { }
}

export class CashbDeleted implements Action {
	readonly type = CashbActionTypes.CashbDeleted;
	constructor(public payload: { id: string }) {}
}

export class CashbPageRequested implements Action {
	readonly type = CashbActionTypes.CashbPageRequested;
	constructor(public payload: { page: QueryCashbModel }) { }
}

export class CashbPageLoaded implements Action {
	readonly type = CashbActionTypes.CashbPageLoaded;
	constructor(public payload: { cashb: CashbModel[], totalCount: number, page: QueryCashbModel  }) { }
}


export class CashbPageCancelled implements Action {
	readonly type = CashbActionTypes.CashbPageCancelled;
}

export class CashbPageToggleLoading implements Action {
	readonly type = CashbActionTypes.CashbPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class CashbActionToggleLoading implements Action {
	readonly type = CashbActionTypes.CashbActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type CashbActions = CashbCreated
	| CashbUpdated
	| CashbDeleted
	| CashbOnServerCreated
	| CashbPageLoaded
	| CashbPageCancelled
	| CashbPageToggleLoading
	| CashbPageRequested
	| CashbActionToggleLoading;
