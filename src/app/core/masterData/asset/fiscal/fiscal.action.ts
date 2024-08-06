// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { FiscalModel } from './fiscal.model';
import { QueryFiscalModel } from './queryfiscal.model';
// Models

export enum FiscalActionTypes {
	AllUsersRequested = '[Fiscal Module] All Fiscal Requested',
	AllUsersLoaded = '[Fiscal API] All Fiscal Loaded',
	FiscalOnServerCreated = '[Edit Fiscal Component] Fiscal On Server Created',
	FiscalCreated = '[Edit Fiscal Dialog] Fiscal Created',
	FiscalUpdated = '[Edit Fiscal Dialog] Fiscal Updated',
	FiscalDeleted = '[Fiscal List Page] Fiscal Deleted',
	FiscalPageRequested = '[Fiscal List Page] Fiscal Page Requested',
	FiscalPageLoaded = '[Fiscal API] Fiscal Page Loaded',
	FiscalPageCancelled = '[Fiscal API] Fiscal Page Cancelled',
	FiscalPageToggleLoading = '[Fiscal] Fiscal Page Toggle Loading',
	FiscalActionToggleLoading = '[Fiscal] Fiscal Action Toggle Loading'
}
export class FiscalOnServerCreated implements Action {
	readonly type = FiscalActionTypes.FiscalOnServerCreated;
	constructor(public payload: { fiscal: FiscalModel }) { }
}

export class FiscalCreated implements Action {
	readonly type = FiscalActionTypes.FiscalCreated;
	constructor(public payload: { fiscal: FiscalModel }) { }
}


export class FiscalUpdated implements Action {
	readonly type = FiscalActionTypes.FiscalUpdated;
	constructor(public payload: {
		partialFiscal: Update<FiscalModel>,
		fiscal: FiscalModel
	}) { }
}

export class FiscalDeleted implements Action {
	readonly type = FiscalActionTypes.FiscalDeleted;

	constructor(public payload: { id: string }) {}
}

export class FiscalPageRequested implements Action {
	readonly type = FiscalActionTypes.FiscalPageRequested;
	constructor(public payload: { page: QueryFiscalModel }) { }
}

export class FiscalPageLoaded implements Action {
	readonly type = FiscalActionTypes.FiscalPageLoaded;
	constructor(public payload: { fiscal: FiscalModel[], totalCount: number, page: QueryFiscalModel  }) { }
}


export class FiscalPageCancelled implements Action {
	readonly type = FiscalActionTypes.FiscalPageCancelled;
}

export class FiscalPageToggleLoading implements Action {
	readonly type = FiscalActionTypes.FiscalPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class FiscalActionToggleLoading implements Action {
	readonly type = FiscalActionTypes.FiscalActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type FiscalActions = FiscalCreated
	| FiscalUpdated
	| FiscalDeleted
	| FiscalOnServerCreated
	| FiscalPageLoaded
	| FiscalPageCancelled
	| FiscalPageToggleLoading
	| FiscalPageRequested
	| FiscalActionToggleLoading;
