// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { GasTransactionModel } from './transaction.model';
import { QueryGasTransactionModel } from './querytransaction.model';
// Models


export enum GasTransactionActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	GasTransactionOnServerCreated = '[Edit GasTransaction Component] GasTransaction On Server Created',
	GasTransactionCreated = '[Edit GasTransaction Dialog] GasTransaction Created',
	GasTransactionUpdated = '[Edit GasTransaction Dialog] GasTransaction Updated',
	GasTransactionDeleted = '[GasTransaction List Page] GasTransaction Deleted',
	GasTransactionPageRequested = '[GasTransaction List Page] GasTransaction Page Requested',
	GasTransactionPageLoaded = '[GasTransaction API] GasTransaction Page Loaded',
	GasTransactionPageCancelled = '[GasTransaction API] GasTransaction Page Cancelled',
	GasTransactionPageToggleLoading = '[GasTransaction] GasTransaction Page Toggle Loading',
	GasTransactionActionToggleLoading = '[GasTransaction] GasTransaction Action Toggle Loading',
	GasTransactionPageUnpost = '[ GasTransaction List Unpost] GasTransaction Page Unpost',
	GasTransactionPageLoadedUnpost = '[ GasTransaction List Unpost] GasTransaction Page Unpost'
}
export class GasTransactionOnServerCreated implements Action {
	readonly type = GasTransactionActionTypes.GasTransactionOnServerCreated;
	constructor(public payload: { gastransaction: GasTransactionModel }) { }
}

export class GasTransactionCreated implements Action {
	readonly type = GasTransactionActionTypes.GasTransactionCreated;
	constructor(public payload: { gastransaction: GasTransactionModel }) { }
}


export class GasTransactionUpdated implements Action {
	readonly type = GasTransactionActionTypes.GasTransactionUpdated;
	constructor(public payload: {
		partialGasTransaction: Update<GasTransactionModel>,
		gastransaction: GasTransactionModel
	}) { }
}

export class GasTransactionDeleted implements Action {
	readonly type = GasTransactionActionTypes.GasTransactionDeleted;

	constructor(public payload: { id: string }) {}
}

export class GasTransactionPageUnpost implements Action {
	readonly type = GasTransactionActionTypes.GasTransactionPageUnpost;
	constructor(public payload: { page: QueryGasTransactionModel }) { }
}

export class GasTransactionPageLoadedUnpost implements Action {
	readonly type = GasTransactionActionTypes.GasTransactionPageLoaded;
	constructor(public payload: { gastransaction: GasTransactionModel[], totalCount: number, page: QueryGasTransactionModel  }) { }
}


export class GasTransactionPageRequested implements Action {
	readonly type = GasTransactionActionTypes.GasTransactionPageRequested;
	constructor(public payload: { page: QueryGasTransactionModel }) { }
}

export class GasTransactionPageLoaded implements Action {
	readonly type = GasTransactionActionTypes.GasTransactionPageLoaded;
	constructor(public payload: { gastransaction: GasTransactionModel[], totalCount: number, page: QueryGasTransactionModel  }) { }
}


export class GasTransactionPageCancelled implements Action {
	readonly type = GasTransactionActionTypes.GasTransactionPageCancelled;
}

export class GasTransactionPageToggleLoading implements Action {
	readonly type = GasTransactionActionTypes.GasTransactionPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class GasTransactionActionToggleLoading implements Action {
	readonly type = GasTransactionActionTypes.GasTransactionActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type GasTransactionActions = GasTransactionCreated
	| GasTransactionUpdated
	| GasTransactionDeleted
	| GasTransactionOnServerCreated
	| GasTransactionPageUnpost
	| GasTransactionPageLoadedUnpost
	| GasTransactionPageLoaded
	| GasTransactionPageCancelled
	| GasTransactionPageToggleLoading
	| GasTransactionPageRequested
	| GasTransactionActionToggleLoading;
