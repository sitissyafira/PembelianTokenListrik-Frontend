// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { DepositModel } from './deposit.model';
// Models
import {QueryDepositModel} from './querydeposit.model';

export enum DepositActionTypes {
	AllUsersRequested = '[Deposit Module] All Deposit Requested',
	AllUsersLoaded = '[Deposit API] All Deposit Loaded',
	DepositOnServerCreated = '[Edit Deposit Component] Deposit On Server Created',
	DepositCreated = '[Edit Deposit Dialog] Deposit Created',
	DepositUpdated = '[Edit Deposit Dialog] Deposit Updated',
	DepositDeleted = '[Deposit List Page] Deposit Deleted',
	DepositPageRequested = '[Deposit List Page] Deposit Page Requested',
	DepositPageLoaded = '[Deposit API] Deposit Page Loaded',
	DepositPageCancelled = '[Deposit API] Deposit Page Cancelled',
	DepositPageToggleLoading = '[Deposit] Deposit Page Toggle Loading',
	DepositActionToggleLoading = '[Deposit] Deposit Action Toggle Loading'
}
export class DepositOnServerCreated implements Action {
	readonly type = DepositActionTypes.DepositOnServerCreated;
	constructor(public payload: { deposit: DepositModel }) { }
}

export class DepositCreated implements Action {
	readonly type = DepositActionTypes.DepositCreated;
	constructor(public payload: { deposit: DepositModel }) { }
}


export class DepositUpdated implements Action {
	readonly type = DepositActionTypes.DepositUpdated;
	constructor(public payload: {
		partialDeposit: Update<DepositModel>,
		deposit: DepositModel
	}) { }
}

export class DepositDeleted implements Action {
	readonly type = DepositActionTypes.DepositDeleted;

	constructor(public payload: { id: string }) {}
}

export class DepositPageRequested implements Action {
	readonly type = DepositActionTypes.DepositPageRequested;
	constructor(public payload: { page: QueryDepositModel }) { }
}

export class DepositPageLoaded implements Action {
	readonly type = DepositActionTypes.DepositPageLoaded;
	constructor(public payload: { deposit: DepositModel[], totalCount: number, page: QueryDepositModel  }) { }
}


export class DepositPageCancelled implements Action {
	readonly type = DepositActionTypes.DepositPageCancelled;
}

export class DepositPageToggleLoading implements Action {
	readonly type = DepositActionTypes.DepositPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class DepositActionToggleLoading implements Action {
	readonly type = DepositActionTypes.DepositActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type DepositActions = DepositCreated
	| DepositUpdated
	| DepositDeleted
	| DepositOnServerCreated
	| DepositPageLoaded
	| DepositPageCancelled
	| DepositPageToggleLoading
	| DepositPageRequested
	| DepositActionToggleLoading;
