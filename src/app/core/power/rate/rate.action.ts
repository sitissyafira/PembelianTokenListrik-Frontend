// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { PowerRateModel } from './rate.model';
// Models
import {QueryPowerRateModel} from './queryrate.model';

export enum PowerRateActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	PowerRateOnServerCreated = '[Edit PowerRate Component] PowerRate On Server Created',
	PowerRateCreated = '[Edit PowerRate Dialog] PowerRate Created',
	PowerRateUpdated = '[Edit PowerRate Dialog] PowerRate Updated',
	PowerRateDeleted = '[PowerRate List Page] PowerRate Deleted',
	PowerRatePageRequested = '[PowerRate List Page] PowerRate Page Requested',
	PowerRatePageLoaded = '[PowerRate API] PowerRate Page Loaded',
	PowerRatePageCancelled = '[PowerRate API] PowerRate Page Cancelled',
	PowerRatePageToggleLoading = '[PowerRate] PowerRate Page Toggle Loading',
	PowerRateActionToggleLoading = '[PowerRate] PowerRate Action Toggle Loading'
}
export class PowerRateOnServerCreated implements Action {
	readonly type = PowerRateActionTypes.PowerRateOnServerCreated;
	constructor(public payload: { powerrate: PowerRateModel }) { }
}

export class PowerRateCreated implements Action {
	readonly type = PowerRateActionTypes.PowerRateCreated;
	constructor(public payload: { powerrate: PowerRateModel }) { }
}


export class PowerRateUpdated implements Action {
	readonly type = PowerRateActionTypes.PowerRateUpdated;
	constructor(public payload: {
		partialPowerRate: Update<PowerRateModel>,
		powerrate: PowerRateModel
	}) { }
}

export class PowerRateDeleted implements Action {
	readonly type = PowerRateActionTypes.PowerRateDeleted;

	constructor(public payload: { id: string }) {}
}

export class PowerRatePageRequested implements Action {
	readonly type = PowerRateActionTypes.PowerRatePageRequested;
	constructor(public payload: { page: QueryPowerRateModel }) { }
}

export class PowerRatePageLoaded implements Action {
	readonly type = PowerRateActionTypes.PowerRatePageLoaded;
	constructor(public payload: { powerrate: PowerRateModel[], totalCount: number, page: QueryPowerRateModel  }) { }
}


export class PowerRatePageCancelled implements Action {
	readonly type = PowerRateActionTypes.PowerRatePageCancelled;
}

export class PowerRatePageToggleLoading implements Action {
	readonly type = PowerRateActionTypes.PowerRatePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class PowerRateActionToggleLoading implements Action {
	readonly type = PowerRateActionTypes.PowerRateActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type PowerRateActions = PowerRateCreated
	| PowerRateUpdated
	| PowerRateDeleted
	| PowerRateOnServerCreated
	| PowerRatePageLoaded
	| PowerRatePageCancelled
	| PowerRatePageToggleLoading
	| PowerRatePageRequested
	| PowerRateActionToggleLoading;
