// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { AccountBankModel } from './accountBank.model';
import { QueryAccountBankModel } from './queryaccountBank.model';
// Models

export enum AccountBankActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	AccountBankOnServerCreated = '[Edit AccountBank Component] AccountBank On Server Created',
	AccountBankCreated = '[Edit AccountBank Dialog] AccountBank Created',
	AccountBankUpdated = '[Edit AccountBank Dialog] AccountBank Updated',
	AccountBankDeleted = '[AccountBank List Page] AccountBank Deleted',
	AccountBankPageRequested = '[AccountBank List Page] AccountBank Page Requested',
	AccountBankPageLoaded = '[AccountBank API] AccountBank Page Loaded',
	AccountBankPageCancelled = '[AccountBank API] AccountBank Page Cancelled',
	AccountBankPageToggleLoading = '[AccountBank] AccountBank Page Toggle Loading',
	AccountBankActionToggleLoading = '[AccountBank] AccountBank Action Toggle Loading'
}
export class AccountBankOnServerCreated implements Action {
	readonly type = AccountBankActionTypes.AccountBankOnServerCreated;
	constructor(public payload: { accountBank: AccountBankModel }) { }
}

export class AccountBankCreated implements Action {
	readonly type = AccountBankActionTypes.AccountBankCreated;
	constructor(public payload: { accountBank: AccountBankModel }) { }
}


export class AccountBankUpdated implements Action {
	readonly type = AccountBankActionTypes.AccountBankUpdated;
	constructor(public payload: {
		partialAccountBank: Update<AccountBankModel>,
		accountBank: AccountBankModel
	}) { }
}

export class AccountBankDeleted implements Action {
	readonly type = AccountBankActionTypes.AccountBankDeleted;

	constructor(public payload: { id: string }) {}
}

export class AccountBankPageRequested implements Action {
	readonly type = AccountBankActionTypes.AccountBankPageRequested;
	constructor(public payload: { page: QueryAccountBankModel }) { }
}

export class AccountBankPageLoaded implements Action {
	readonly type = AccountBankActionTypes.AccountBankPageLoaded;
	constructor(public payload: { accountBank: AccountBankModel[], totalCount: number, page: QueryAccountBankModel  }) { }
}


export class AccountBankPageCancelled implements Action {
	readonly type = AccountBankActionTypes.AccountBankPageCancelled;
}

export class AccountBankPageToggleLoading implements Action {
	readonly type = AccountBankActionTypes.AccountBankPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class AccountBankActionToggleLoading implements Action {
	readonly type = AccountBankActionTypes.AccountBankActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type AccountBankActions = AccountBankCreated
	| AccountBankUpdated
	| AccountBankDeleted
	| AccountBankOnServerCreated
	| AccountBankPageLoaded
	| AccountBankPageCancelled
	| AccountBankPageToggleLoading
	| AccountBankPageRequested
	| AccountBankActionToggleLoading;
