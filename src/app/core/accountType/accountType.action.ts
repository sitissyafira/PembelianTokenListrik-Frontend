// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { AccountTypeModel } from './accountType.model';
import { QueryAccountTypeModel } from './queryaccounttype.model';
// Models

export enum AccountTypeActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	AccountTypeOnServerCreated = '[Edit AccountType Component] AccountType On Server Created',
	AccountTypeCreated = '[Edit AccountType Dialog] AccountType Created',
	AccountTypeUpdated = '[Edit AccountType Dialog] AccountType Updated',
	AccountTypeDeleted = '[AccountType List Page] AccountType Deleted',
	AccountTypePageRequested = '[AccountType List Page] AccountType Page Requested',
	AccountTypePageLoaded = '[AccountType API] AccountType Page Loaded',
	AccountTypePageCancelled = '[AccountType API] AccountType Page Cancelled',
	AccountTypePageToggleLoading = '[AccountType] AccountType Page Toggle Loading',
	AccountTypeActionToggleLoading = '[AccountType] AccountType Action Toggle Loading'
}
export class AccountTypeOnServerCreated implements Action {
	readonly type = AccountTypeActionTypes.AccountTypeOnServerCreated;
	constructor(public payload: { accountType: AccountTypeModel }) { }
}

export class AccountTypeCreated implements Action {
	readonly type = AccountTypeActionTypes.AccountTypeCreated;
	constructor(public payload: { accountType: AccountTypeModel }) { }
}


export class AccountTypeUpdated implements Action {
	readonly type = AccountTypeActionTypes.AccountTypeUpdated;
	constructor(public payload: {
		partialAccountType: Update<AccountTypeModel>,
		accountType: AccountTypeModel
	}) { }
}

export class AccountTypeDeleted implements Action {
	readonly type = AccountTypeActionTypes.AccountTypeDeleted;

	constructor(public payload: { id: string }) {}
}

export class AccountTypePageRequested implements Action {
	readonly type = AccountTypeActionTypes.AccountTypePageRequested;
	constructor(public payload: { page: QueryAccountTypeModel }) { }
}

export class AccountTypePageLoaded implements Action {
	readonly type = AccountTypeActionTypes.AccountTypePageLoaded;
	constructor(public payload: { accountType: AccountTypeModel[], totalCount: number, page: QueryAccountTypeModel  }) { }
}


export class AccountTypePageCancelled implements Action {
	readonly type = AccountTypeActionTypes.AccountTypePageCancelled;
}

export class AccountTypePageToggleLoading implements Action {
	readonly type = AccountTypeActionTypes.AccountTypePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class AccountTypeActionToggleLoading implements Action {
	readonly type = AccountTypeActionTypes.AccountTypeActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type AccountTypeActions = AccountTypeCreated
	| AccountTypeUpdated
	| AccountTypeDeleted
	| AccountTypeOnServerCreated
	| AccountTypePageLoaded
	| AccountTypePageCancelled
	| AccountTypePageToggleLoading
	| AccountTypePageRequested
	| AccountTypeActionToggleLoading;
