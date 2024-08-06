// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { AccountHistoryModel } from './accountHistory.model';
import { QueryAccountHistoryModel } from './queryaccountHistory.model';
// Models

export enum AccountHistoryActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	AccountHistoryOnServerCreated = '[Edit AccountHistory Component] AccountHistory On Server Created',
	AccountHistoryCreated = '[Edit AccountHistory Dialog] AccountHistory Created',
	AccountHistoryUpdated = '[Edit AccountHistory Dialog] AccountHistory Updated',
	AccountHistoryDeleted = '[AccountHistory List Page] AccountHistory Deleted',
	AccountHistoryPageRequested = '[AccountHistory List Page] AccountHistory Page Requested',
	AccountHistoryPageLoaded = '[AccountHistory API] AccountHistory Page Loaded',
	AccountHistoryPageCancelled = '[AccountHistory API] AccountHistory Page Cancelled',
	AccountHistoryPageToggleLoading = '[AccountHistory] AccountHistory Page Toggle Loading',
	AccountHistoryActionToggleLoading = '[AccountHistory] AccountHistory Action Toggle Loading'
}
export class AccountHistoryOnServerCreated implements Action {
	readonly type = AccountHistoryActionTypes.AccountHistoryOnServerCreated;
	constructor(public payload: { accountHistory: AccountHistoryModel }) { }
}

export class AccountHistoryCreated implements Action {
	readonly type = AccountHistoryActionTypes.AccountHistoryCreated;
	constructor(public payload: { accountHistory: AccountHistoryModel }) { }
}


export class AccountHistoryUpdated implements Action {
	readonly type = AccountHistoryActionTypes.AccountHistoryUpdated;
	constructor(public payload: {
		partialAccountHistory: Update<AccountHistoryModel>,
		accountHistory: AccountHistoryModel
	}) { }
}

export class AccountHistoryDeleted implements Action {
	readonly type = AccountHistoryActionTypes.AccountHistoryDeleted;

	constructor(public payload: { id: string }) {}
}

export class AccountHistoryPageRequested implements Action {
	readonly type = AccountHistoryActionTypes.AccountHistoryPageRequested;
	constructor(public payload: { page: QueryAccountHistoryModel }) { }
}

export class AccountHistoryPageLoaded implements Action {
	readonly type = AccountHistoryActionTypes.AccountHistoryPageLoaded;
	constructor(public payload: { accountHistory: AccountHistoryModel[], totalCount: number, page: QueryAccountHistoryModel  }) { }
}


export class AccountHistoryPageCancelled implements Action {
	readonly type = AccountHistoryActionTypes.AccountHistoryPageCancelled;
}

export class AccountHistoryPageToggleLoading implements Action {
	readonly type = AccountHistoryActionTypes.AccountHistoryPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class AccountHistoryActionToggleLoading implements Action {
	readonly type = AccountHistoryActionTypes.AccountHistoryActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type AccountHistoryActions = AccountHistoryCreated
	| AccountHistoryUpdated
	| AccountHistoryDeleted
	| AccountHistoryOnServerCreated
	| AccountHistoryPageLoaded
	| AccountHistoryPageCancelled
	| AccountHistoryPageToggleLoading
	| AccountHistoryPageRequested
	| AccountHistoryActionToggleLoading;
