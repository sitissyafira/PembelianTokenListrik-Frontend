// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { AccountCategoryModel } from './accountCategory.model';
import { QueryAccountCategoryModel } from './queryaccountcategory.model';
// Models

export enum AccountCategoryActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	AccountCategoryOnServerCreated = '[Edit AccountCategory Component] AccountCategory On Server Created',
	AccountCategoryCreated = '[Edit AccountCategory Dialog] AccountCategory Created',
	AccountCategoryUpdated = '[Edit AccountCategory Dialog] AccountCategory Updated',
	AccountCategoryDeleted = '[AccountCategory List Page] AccountCategory Deleted',
	AccountCategoryPageRequested = '[AccountCategory List Page] AccountCategory Page Requested',
	AccountCategoryPageLoaded = '[AccountCategory API] AccountCategory Page Loaded',
	AccountCategoryPageCancelled = '[AccountCategory API] AccountCategory Page Cancelled',
	AccountCategoryPageToggleLoading = '[AccountCategory] AccountCategory Page Toggle Loading',
	AccountCategoryActionToggleLoading = '[AccountCategory] AccountCategory Action Toggle Loading'
}
export class AccountCategoryOnServerCreated implements Action {
	readonly type = AccountCategoryActionTypes.AccountCategoryOnServerCreated;
	constructor(public payload: { accountCategory: AccountCategoryModel }) { }
}

export class AccountCategoryCreated implements Action {
	readonly type = AccountCategoryActionTypes.AccountCategoryCreated;
	constructor(public payload: { accountCategory: AccountCategoryModel }) { }
}


export class AccountCategoryUpdated implements Action {
	readonly type = AccountCategoryActionTypes.AccountCategoryUpdated;
	constructor(public payload: {
		partialAccountCategory: Update<AccountCategoryModel>,
		accountCategory: AccountCategoryModel
	}) { }
}

export class AccountCategoryDeleted implements Action {
	readonly type = AccountCategoryActionTypes.AccountCategoryDeleted;

	constructor(public payload: { id: string }) {}
}

export class AccountCategoryPageRequested implements Action {
	readonly type = AccountCategoryActionTypes.AccountCategoryPageRequested;
	constructor(public payload: { page: QueryAccountCategoryModel }) { }
}

export class AccountCategoryPageLoaded implements Action {
	readonly type = AccountCategoryActionTypes.AccountCategoryPageLoaded;
	constructor(public payload: { accountCategory: AccountCategoryModel[], totalCount: number, page: QueryAccountCategoryModel  }) { }
}


export class AccountCategoryPageCancelled implements Action {
	readonly type = AccountCategoryActionTypes.AccountCategoryPageCancelled;
}

export class AccountCategoryPageToggleLoading implements Action {
	readonly type = AccountCategoryActionTypes.AccountCategoryPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class AccountCategoryActionToggleLoading implements Action {
	readonly type = AccountCategoryActionTypes.AccountCategoryActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type AccountCategoryActions = AccountCategoryCreated
	| AccountCategoryUpdated
	| AccountCategoryDeleted
	| AccountCategoryOnServerCreated
	| AccountCategoryPageLoaded
	| AccountCategoryPageCancelled
	| AccountCategoryPageToggleLoading
	| AccountCategoryPageRequested
	| AccountCategoryActionToggleLoading;
