// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { AccountGroupModel } from './accountGroup.model';
import { QueryAccountGroupModel } from './queryag.model';
// Models

export enum AccountGroupActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	AccountGroupOnServerCreated = '[Edit AccountGroup Component] AccountGroup On Server Created',
	AccountGroupCreated = '[Edit AccountGroup Dialog] AccountGroup Created',
	AccountGroupUpdated = '[Edit AccountGroup Dialog] AccountGroup Updated',
	AccountGroupDeleted = '[AccountGroup List Page] AccountGroup Deleted',
	AccountGroupPageRequested = '[AccountGroup List Page] AccountGroup Page Requested',
	AccountGroupPageLoaded = '[AccountGroup API] AccountGroup Page Loaded',
	AccountGroupPageCancelled = '[AccountGroup API] AccountGroup Page Cancelled',
	AccountGroupPageToggleLoading = '[AccountGroup] AccountGroup Page Toggle Loading',
	AccountGroupActionToggleLoading = '[AccountGroup] AccountGroup Action Toggle Loading'
}
export class AccountGroupOnServerCreated implements Action {
	readonly type = AccountGroupActionTypes.AccountGroupOnServerCreated;
	constructor(public payload: { accountGroup: AccountGroupModel }) { }
}

export class AccountGroupCreated implements Action {
	readonly type = AccountGroupActionTypes.AccountGroupCreated;
	constructor(public payload: { accountGroup: AccountGroupModel }) { }
}


export class AccountGroupUpdated implements Action {
	readonly type = AccountGroupActionTypes.AccountGroupUpdated;
	constructor(public payload: {
		partialAccountGroup: Update<AccountGroupModel>,
		accountGroup: AccountGroupModel
	}) { }
}

export class AccountGroupDeleted implements Action {
	readonly type = AccountGroupActionTypes.AccountGroupDeleted;

	constructor(public payload: { id: string }) {}
}

export class AccountGroupPageRequested implements Action {
	readonly type = AccountGroupActionTypes.AccountGroupPageRequested;
	constructor(public payload: { page: QueryAccountGroupModel }) { }
}

export class AccountGroupPageLoaded implements Action {
	readonly type = AccountGroupActionTypes.AccountGroupPageLoaded;
	constructor(public payload: { accountGroup: AccountGroupModel[], totalCount: number, page: QueryAccountGroupModel  }) { }
}


export class AccountGroupPageCancelled implements Action {
	readonly type = AccountGroupActionTypes.AccountGroupPageCancelled;
}

export class AccountGroupPageToggleLoading implements Action {
	readonly type = AccountGroupActionTypes.AccountGroupPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class AccountGroupActionToggleLoading implements Action {
	readonly type = AccountGroupActionTypes.AccountGroupActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type AccountGroupActions = AccountGroupCreated
	| AccountGroupUpdated
	| AccountGroupDeleted
	| AccountGroupOnServerCreated
	| AccountGroupPageLoaded
	| AccountGroupPageCancelled
	| AccountGroupPageToggleLoading
	| AccountGroupPageRequested
	| AccountGroupActionToggleLoading;
