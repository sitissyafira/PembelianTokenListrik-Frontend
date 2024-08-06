// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { WaterRateModel } from './rate.model';
// Models
import {QueryWaterRateModel} from './queryrate.model';

export enum WaterRateActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	WaterRateOnServerCreated = '[Edit WaterRate Component] WaterRate On Server Created',
	WaterRateCreated = '[Edit WaterRate Dialog] WaterRate Created',
	WaterRateUpdated = '[Edit WaterRate Dialog] WaterRate Updated',
	WaterRateDeleted = '[WaterRate List Page] WaterRate Deleted',
	WaterRatePageRequested = '[WaterRate List Page] WaterRate Page Requested',
	WaterRatePageLoaded = '[WaterRate API] WaterRate Page Loaded',
	WaterRatePageCancelled = '[WaterRate API] WaterRate Page Cancelled',
	WaterRatePageToggleLoading = '[WaterRate] WaterRate Page Toggle Loading',
	WaterRateActionToggleLoading = '[WaterRate] WaterRate Action Toggle Loading'
}
export class WaterRateOnServerCreated implements Action {
	readonly type = WaterRateActionTypes.WaterRateOnServerCreated;
	constructor(public payload: { waterrate: WaterRateModel }) { }
}

export class WaterRateCreated implements Action {
	readonly type = WaterRateActionTypes.WaterRateCreated;
	constructor(public payload: { waterrate: WaterRateModel }) { }
}


export class WaterRateUpdated implements Action {
	readonly type = WaterRateActionTypes.WaterRateUpdated;
	constructor(public payload: {
		partialWaterRate: Update<WaterRateModel>,
		waterrate: WaterRateModel
	}) { }
}

export class WaterRateDeleted implements Action {
	readonly type = WaterRateActionTypes.WaterRateDeleted;

	constructor(public payload: { id: string }) {}
}

export class WaterRatePageRequested implements Action {
	readonly type = WaterRateActionTypes.WaterRatePageRequested;
	constructor(public payload: { page: QueryWaterRateModel }) { console.log("requested")}
}

export class WaterRatePageLoaded implements Action {
	readonly type = WaterRateActionTypes.WaterRatePageLoaded;
	constructor(public payload: { waterrate: WaterRateModel[], totalCount: number, page: QueryWaterRateModel  }) { }
}


export class WaterRatePageCancelled implements Action {
	readonly type = WaterRateActionTypes.WaterRatePageCancelled;
}

export class WaterRatePageToggleLoading implements Action {
	readonly type = WaterRateActionTypes.WaterRatePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class WaterRateActionToggleLoading implements Action {
	readonly type = WaterRateActionTypes.WaterRateActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type WaterRateActions = WaterRateCreated
	| WaterRateUpdated
	| WaterRateDeleted
	| WaterRateOnServerCreated
	| WaterRatePageLoaded
	| WaterRatePageCancelled
	| WaterRatePageToggleLoading
	| WaterRatePageRequested
	| WaterRateActionToggleLoading;
