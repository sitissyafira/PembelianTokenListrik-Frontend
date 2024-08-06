// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { GalonRateModel } from './rate.model';
// Models
import { QueryGalonRateModel } from './queryrate.model';

export enum GalonRateActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	GalonRateOnServerCreated = '[Edit GalonRate Component] GalonRate On Server Created',
	GalonRateCreated = '[Edit GalonRate Dialog] GalonRate Created',
	GalonRateUpdated = '[Edit GalonRate Dialog] GalonRate Updated',
	GalonRateDeleted = '[GalonRate List Page] GalonRate Deleted',
	GalonRatePageRequested = '[GalonRate List Page] GalonRate Page Requested',
	GalonRatePageLoaded = '[GalonRate API] GalonRate Page Loaded',
	GalonRatePageCancelled = '[GalonRate API] GalonRate Page Cancelled',
	GalonRatePageToggleLoading = '[GalonRate] GalonRate Page Toggle Loading',
	GalonRateActionToggleLoading = '[GalonRate] GalonRate Action Toggle Loading'
}
export class GalonRateOnServerCreated implements Action {
	readonly type = GalonRateActionTypes.GalonRateOnServerCreated;
	constructor(public payload: { galonrate: GalonRateModel }) { }
}

export class GalonRateCreated implements Action {
	readonly type = GalonRateActionTypes.GalonRateCreated;
	constructor(public payload: { galonrate: GalonRateModel }) { }
}


export class GalonRateUpdated implements Action {
	readonly type = GalonRateActionTypes.GalonRateUpdated;
	constructor(public payload: {
		partialGalonRate: Update<GalonRateModel>,
		galonrate: GalonRateModel
	}) { }
}

export class GalonRateDeleted implements Action {
	readonly type = GalonRateActionTypes.GalonRateDeleted;

	constructor(public payload: { id: string }) { }
}

export class GalonRatePageRequested implements Action {
	readonly type = GalonRateActionTypes.GalonRatePageRequested;
	constructor(public payload: { page: QueryGalonRateModel }) { }
}

export class GalonRatePageLoaded implements Action {
	readonly type = GalonRateActionTypes.GalonRatePageLoaded;
	constructor(public payload: { galonrate: GalonRateModel[], totalCount: number, page: QueryGalonRateModel }) { }
}


export class GalonRatePageCancelled implements Action {
	readonly type = GalonRateActionTypes.GalonRatePageCancelled;
}

export class GalonRatePageToggleLoading implements Action {
	readonly type = GalonRateActionTypes.GalonRatePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class GalonRateActionToggleLoading implements Action {
	readonly type = GalonRateActionTypes.GalonRateActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type GalonRateActions = GalonRateCreated
	| GalonRateUpdated
	| GalonRateDeleted
	| GalonRateOnServerCreated
	| GalonRatePageLoaded
	| GalonRatePageCancelled
	| GalonRatePageToggleLoading
	| GalonRatePageRequested
	| GalonRateActionToggleLoading;
