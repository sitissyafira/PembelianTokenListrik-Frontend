import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { TrGalonModel } from './trGalon.model';
// Models
import { QueryTrGalonModel } from './querytrGalon.model';


export enum TrGalonActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	TrGalonOnServerCreated = '[Edit TrGalon Component] TrGalon On Server Created',
	TrGalonCreated = '[Edit TrGalon Dialog] TrGalon Created',
	TrGalonUpdated = '[Edit TrGalon Dialog] TrGalon Updated',
	TrGalonDeleted = '[TrGalon List Page] TrGalon Deleted',
	TrGalonPageRequested = '[TrGalon List Page] TrGalon Page Requested',
	TrGalonPageRequestedLog = '[TrGalonLog ListLog Page] TrGalonLog Page Requested',
	TrGalonPageLoaded = '[TrGalon API] TrGalon Page Loaded',
	TrGalonPageCancelled = '[TrGalon API] TrGalon Page Cancelled',
	TrGalonPageToggleLoading = '[TrGalon] TrGalon Page Toggle Loading',
	TrGalonActionToggleLoading = '[TrGalon] TrGalon Action Toggle Loading'
}

export class TrGalonOnServerCreated implements Action {
	readonly type = TrGalonActionTypes.TrGalonOnServerCreated;
	constructor(public payload: { trGalon: TrGalonModel }) { }
}

export class TrGalonCreated implements Action {
	readonly type = TrGalonActionTypes.TrGalonCreated;
	constructor(public payload: { trGalon: TrGalonModel }) { }
}

export class TrGalonUpdated implements Action {
	readonly type = TrGalonActionTypes.TrGalonUpdated;
	constructor(public payload: {
		partialTrGalon: Update<TrGalonModel>,
		trGalon: TrGalonModel
	}) { }
}

export class TrGalonDeleted implements Action {
	readonly type = TrGalonActionTypes.TrGalonDeleted;
	constructor(public payload: { id: string }) { }
}

export class TrGalonPageRequested implements Action {
	readonly type = TrGalonActionTypes.TrGalonPageRequested;
	constructor(public payload: { page: QueryTrGalonModel }) { }
}

export class TrGalonPageRequestedLog implements Action {
	readonly type = TrGalonActionTypes.TrGalonPageRequestedLog;
	constructor(public payload: { page: QueryTrGalonModel }) { }
}

export class TrGalonPageLoaded implements Action {
	readonly type = TrGalonActionTypes.TrGalonPageLoaded;
	constructor(public payload: { trGalon: TrGalonModel[], totalCount: number, page: QueryTrGalonModel }) { }
}


export class TrGalonPageCancelled implements Action {
	readonly type = TrGalonActionTypes.TrGalonPageCancelled;
}

export class TrGalonPageToggleLoading implements Action {
	readonly type = TrGalonActionTypes.TrGalonPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class TrGalonActionToggleLoading implements Action {
	readonly type = TrGalonActionTypes.TrGalonActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type TrGalonActions = TrGalonCreated
	| TrGalonUpdated
	| TrGalonDeleted
	| TrGalonOnServerCreated
	| TrGalonPageLoaded
	| TrGalonPageCancelled
	| TrGalonPageToggleLoading
	| TrGalonPageRequested
	| TrGalonActionToggleLoading
