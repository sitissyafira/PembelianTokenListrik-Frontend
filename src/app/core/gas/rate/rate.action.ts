// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { GasRateModel } from './rate.model';
// Models
import {QueryGasRateModel} from './queryrate.model';

export enum GasRateActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	GasRateOnServerCreated = '[Edit GasRate Component] GasRate On Server Created',
	GasRateCreated = '[Edit GasRate Dialog] GasRate Created',
	GasRateUpdated = '[Edit GasRate Dialog] GasRate Updated',
	GasRateDeleted = '[GasRate List Page] GasRate Deleted',
	GasRatePageRequested = '[GasRate List Page] GasRate Page Requested',
	GasRatePageLoaded = '[GasRate API] GasRate Page Loaded',
	GasRatePageCancelled = '[GasRate API] GasRate Page Cancelled',
	GasRatePageToggleLoading = '[GasRate] GasRate Page Toggle Loading',
	GasRateActionToggleLoading = '[GasRate] GasRate Action Toggle Loading'
}
export class GasRateOnServerCreated implements Action {
	readonly type = GasRateActionTypes.GasRateOnServerCreated;
	constructor(public payload: { gasrate: GasRateModel }) { }
}

export class GasRateCreated implements Action {
	readonly type = GasRateActionTypes.GasRateCreated;
	constructor(public payload: { gasrate: GasRateModel }) { }
}


export class GasRateUpdated implements Action {
	readonly type = GasRateActionTypes.GasRateUpdated;
	constructor(public payload: {
		partialGasRate: Update<GasRateModel>,
		gasrate: GasRateModel
	}) { }
}

export class GasRateDeleted implements Action {
	readonly type = GasRateActionTypes.GasRateDeleted;

	constructor(public payload: { id: string }) {}
}

export class GasRatePageRequested implements Action {
	readonly type = GasRateActionTypes.GasRatePageRequested;
	constructor(public payload: { page: QueryGasRateModel }) { console.log("requested")}
}

export class GasRatePageLoaded implements Action {
	readonly type = GasRateActionTypes.GasRatePageLoaded;
	constructor(public payload: { gasrate: GasRateModel[], totalCount: number, page: QueryGasRateModel  }) { }
}


export class GasRatePageCancelled implements Action {
	readonly type = GasRateActionTypes.GasRatePageCancelled;
}

export class GasRatePageToggleLoading implements Action {
	readonly type = GasRateActionTypes.GasRatePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class GasRateActionToggleLoading implements Action {
	readonly type = GasRateActionTypes.GasRateActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type GasRateActions = GasRateCreated
	| GasRateUpdated
	| GasRateDeleted
	| GasRateOnServerCreated
	| GasRatePageLoaded
	| GasRatePageCancelled
	| GasRatePageToggleLoading
	| GasRatePageRequested
	| GasRateActionToggleLoading;
