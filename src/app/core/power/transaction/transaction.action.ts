// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { PowerTransactionModel } from './transaction.model';
import { QueryPowerTransactionModel } from './querytransaction.model';
// Models

export enum PowerTransactionActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	PowerTransactionOnServerCreated = '[Edit PowerTransaction Component] PowerTransaction On Server Created',
	PowerTransactionCreated = '[Edit PowerTransaction Dialog] PowerTransaction Created',
	PowerTransactionUpdated = '[Edit PowerTransaction Dialog] PowerTransaction Updated',
	PowerTransactionDeleted = '[PowerTransaction List Page] PowerTransaction Deleted',
	PowerTransactionPageRequested = '[PowerTransaction List Page] PowerTransaction Page Requested',
	PowerTransactionPageLoaded = '[PowerTransaction API] PowerTransaction Page Loaded',
	PowerTransactionPageCancelled = '[PowerTransaction API] PowerTransaction Page Cancelled',
	PowerTransactionPageToggleLoading = '[PowerTransaction] PowerTransaction Page Toggle Loading',
	PowerTransactionActionToggleLoading = '[PowerTransaction] PowerTransaction Action Toggle Loading',
	PowerTransactionPageRequestedUnpost = '[PowerTransaction] PowerTransaction Action Toggle Loading',
	PowerTransactionPageLoadedUnpost = '[PowerTransaction] PowerTransaction Page Toggle Loading'
}
export class PowerTransactionOnServerCreated implements Action {
	readonly type = PowerTransactionActionTypes.PowerTransactionOnServerCreated;
	constructor(public payload: { powertransaction: PowerTransactionModel }) { }
}

export class PowerTransactionCreated implements Action {
	readonly type = PowerTransactionActionTypes.PowerTransactionCreated;
	constructor(public payload: { powertransaction: PowerTransactionModel }) { }
}


export class PowerTransactionUpdated implements Action {
	readonly type = PowerTransactionActionTypes.PowerTransactionUpdated;
	constructor(public payload: {
		partialPowerTransaction: Update<PowerTransactionModel>,
		powertransaction: PowerTransactionModel
	}) { }
}

export class PowerTransactionDeleted implements Action {
	readonly type = PowerTransactionActionTypes.PowerTransactionDeleted;

	constructor(public payload: { id: string }) {}
}

export class PowerTransactionPageRequestedUnpost implements Action {
	readonly type = PowerTransactionActionTypes.PowerTransactionPageRequestedUnpost;
	constructor(public payload: { page: QueryPowerTransactionModel }) { }
}

export class PowerTransactionPageLoadedUnpost implements Action {
	readonly type = PowerTransactionActionTypes.PowerTransactionPageLoaded;
	constructor(public payload: { powertransaction: PowerTransactionModel[],allTotalCount:number, totalCount: number, page: QueryPowerTransactionModel  }) { }
}


export class PowerTransactionPageRequested implements Action {
	readonly type = PowerTransactionActionTypes.PowerTransactionPageRequested;
	constructor(public payload: { page: QueryPowerTransactionModel }) { }
}

export class PowerTransactionPageLoaded implements Action {
	readonly type = PowerTransactionActionTypes.PowerTransactionPageLoaded;
	constructor(public payload: { powertransaction: PowerTransactionModel[],allTotalCount:number, totalCount: number, page: QueryPowerTransactionModel  }) { }
}


export class PowerTransactionPageCancelled implements Action {
	readonly type = PowerTransactionActionTypes.PowerTransactionPageCancelled;
}

export class PowerTransactionPageToggleLoading implements Action {
	readonly type = PowerTransactionActionTypes.PowerTransactionPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class PowerTransactionActionToggleLoading implements Action {
	readonly type = PowerTransactionActionTypes.PowerTransactionActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type PowerTransactionActions = PowerTransactionCreated
	| PowerTransactionUpdated
	| PowerTransactionDeleted
	| PowerTransactionOnServerCreated
	| PowerTransactionPageLoaded
	| PowerTransactionPageCancelled
	| PowerTransactionPageToggleLoading
	| PowerTransactionPageRequested
	| PowerTransactionActionToggleLoading;
