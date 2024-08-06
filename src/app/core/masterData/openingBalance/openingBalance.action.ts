// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { OpeningBalanceModel } from './openingBalance.model';
import { QueryOpeningBalanceModel } from './queryaopeningBalance.model';


// Models

export enum OpeningBalanceActionTypes {
	AllUsersRequested = '[OpeningBalance Module] All OpeningBalance Requested',
	AllUsersLoaded = '[OpeningBalance  API] All OpeningBalance Loaded',
	OpeningBalanceOnServerCreated = '[Edit OpeningBalance Component] OpeningBalance On Server Created',
	OpeningBalanceCreated = '[Edit OpeningBalance Dialog] OpeningBalance Created',
	OpeningBalanceUpdated = '[Edit OpeningBalance Dialog] OpeningBalance Updated',
	OpeningBalanceDeleted = '[OpeningBalance List Page] OpeningBalance Deleted',
	OpeningBalancePageRequested = '[OpeningBalance List Page] OpeningBalance Page Requested',
	OpeningBalancePageLoaded = '[OpeningBalance API] OpeningBalance Page Loaded',
	OpeningBalancePageCancelled = '[OpeningBalance API] OpeningBalance Page Cancelled',
	OpeningBalancePageToggleLoading = '[OpeningBalance] OpeningBalance Page Toggle Loading',
	OpeningBalanceActionToggleLoading = '[OpeningBalance] OpeningBalance Action Toggle Loading'
}
export class OpeningBalanceOnServerCreated implements Action {
	readonly type = OpeningBalanceActionTypes.OpeningBalanceOnServerCreated;
	constructor(public payload: { openingBalance: OpeningBalanceModel }) { }
}

export class OpeningBalanceCreated implements Action {
	readonly type = OpeningBalanceActionTypes.OpeningBalanceCreated;
	constructor(public payload: { openingBalance: OpeningBalanceModel }) { }
}


export class OpeningBalanceUpdated implements Action {
	readonly type = OpeningBalanceActionTypes.OpeningBalanceUpdated;
	constructor(public payload: {
		partialOpeningBalance: Update<OpeningBalanceModel>,
		openingBalance: OpeningBalanceModel
	}) { }
}

export class OpeningBalanceDeleted implements Action {
	readonly type = OpeningBalanceActionTypes.OpeningBalanceDeleted;

	constructor(public payload: { id: string }) {}
}

export class OpeningBalancePageRequested implements Action {
	readonly type = OpeningBalanceActionTypes.OpeningBalancePageRequested;
	constructor(public payload: { page: QueryOpeningBalanceModel }) { }
}

export class OpeningBalancePageLoaded implements Action {
	readonly type = OpeningBalanceActionTypes.OpeningBalancePageLoaded;
	constructor(public payload: { openingBalance: OpeningBalanceModel[], totalCount: number, page: QueryOpeningBalanceModel  }) { }
}


export class OpeningBalancePageCancelled implements Action {
	readonly type = OpeningBalanceActionTypes.OpeningBalancePageCancelled;
}

export class OpeningBalancePageToggleLoading implements Action {
	readonly type = OpeningBalanceActionTypes.OpeningBalancePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class OpeningBalanceActionToggleLoading implements Action {
	readonly type = OpeningBalanceActionTypes.OpeningBalanceActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type OpeningBalanceActions = OpeningBalanceCreated
	| OpeningBalanceUpdated
	| OpeningBalanceDeleted
	| OpeningBalanceOnServerCreated
	| OpeningBalancePageLoaded
	| OpeningBalancePageCancelled
	| OpeningBalancePageToggleLoading
	| OpeningBalancePageRequested
	| OpeningBalanceActionToggleLoading;
