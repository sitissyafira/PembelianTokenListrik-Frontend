// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { WaterTransactionModel } from './transaction.model';
import { QueryWaterTransactionModel } from './querytransaction.model';
// Models


export enum WaterTransactionActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	WaterTransactionOnServerCreated = '[Edit WaterTransaction Component] WaterTransaction On Server Created',
	WaterTransactionCreated = '[Edit WaterTransaction Dialog] WaterTransaction Created',
	WaterTransactionUpdated = '[Edit WaterTransaction Dialog] WaterTransaction Updated',
	WaterTransactionDeleted = '[WaterTransaction List Page] WaterTransaction Deleted',
	WaterTransactionPageRequested = '[WaterTransaction List Page] WaterTransaction Page Requested',
	WaterTransactionPageLoaded = '[WaterTransaction API] WaterTransaction Page Loaded',
	WaterTransactionPageCancelled = '[WaterTransaction API] WaterTransaction Page Cancelled',
	WaterTransactionPageToggleLoading = '[WaterTransaction] WaterTransaction Page Toggle Loading',
	WaterTransactionActionToggleLoading = '[WaterTransaction] WaterTransaction Action Toggle Loading',
	WaterTransactionPageUnpost = '[ WaterTransaction List Unpost] WaterTransaction Page Unpost',
	WaterTransactionPageLoadedUnpost = '[ WaterTransaction List Unpost] WaterTransaction Page Unpost'
}
export class WaterTransactionOnServerCreated implements Action {
	readonly type = WaterTransactionActionTypes.WaterTransactionOnServerCreated;
	constructor(public payload: { watertransaction: WaterTransactionModel }) { }
}

export class WaterTransactionCreated implements Action {
	readonly type = WaterTransactionActionTypes.WaterTransactionCreated;
	constructor(public payload: { watertransaction: WaterTransactionModel }) { }
}


export class WaterTransactionUpdated implements Action {
	readonly type = WaterTransactionActionTypes.WaterTransactionUpdated;
	constructor(public payload: {
		partialWaterTransaction: Update<WaterTransactionModel>,
		watertransaction: WaterTransactionModel
	}) { }
}

export class WaterTransactionDeleted implements Action {
	readonly type = WaterTransactionActionTypes.WaterTransactionDeleted;

	constructor(public payload: { id: string }) {}
}

export class WaterTransactionPageUnpost implements Action {
	readonly type = WaterTransactionActionTypes.WaterTransactionPageUnpost;
	constructor(public payload: { page: QueryWaterTransactionModel }) { }
}

export class WaterTransactionPageLoadedUnpost implements Action {
	readonly type = WaterTransactionActionTypes.WaterTransactionPageLoaded;
	constructor(public payload: { watertransaction: WaterTransactionModel[],allTotalCount:number, totalCount: number, page: QueryWaterTransactionModel  }) { }
}


export class WaterTransactionPageRequested implements Action {
	readonly type = WaterTransactionActionTypes.WaterTransactionPageRequested;
	constructor(public payload: { page: QueryWaterTransactionModel }) { }
}

export class WaterTransactionPageLoaded implements Action {
	readonly type = WaterTransactionActionTypes.WaterTransactionPageLoaded;
	constructor(public payload: { watertransaction: WaterTransactionModel[],allTotalCount:number, totalCount: number, page: QueryWaterTransactionModel  }) { }
}


export class WaterTransactionPageCancelled implements Action {
	readonly type = WaterTransactionActionTypes.WaterTransactionPageCancelled;
}

export class WaterTransactionPageToggleLoading implements Action {
	readonly type = WaterTransactionActionTypes.WaterTransactionPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class WaterTransactionActionToggleLoading implements Action {
	readonly type = WaterTransactionActionTypes.WaterTransactionActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type WaterTransactionActions = WaterTransactionCreated
	| WaterTransactionUpdated
	| WaterTransactionDeleted
	| WaterTransactionOnServerCreated
	| WaterTransactionPageUnpost
	| WaterTransactionPageLoadedUnpost
	| WaterTransactionPageLoaded
	| WaterTransactionPageCancelled
	| WaterTransactionPageToggleLoading
	| WaterTransactionPageRequested
	| WaterTransactionActionToggleLoading;
