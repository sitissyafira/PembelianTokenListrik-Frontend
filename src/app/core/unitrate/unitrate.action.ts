// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { UnitRateModel} from './unitrate.model';
// Models
import {QueryParamsModel} from '../_base/crud/models/query-models/query-params.model';

export enum UnitRateActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	UnitRateOnServerCreated = '[Edit UnitRate Component] UnitRate On Server Created',
	UnitRateCreated = '[Edit UnitRate Dialog] UnitRate Created',
	UnitRateUpdated = '[Edit UnitRate Dialog] UnitRate Updated',
	UnitRateDeleted = '[UnitRate List Page] UnitRate Deleted',
	UnitRatePageRequested = '[UnitRate List Page] UnitRate Page Requested',
	UnitRatePageLoaded = '[UnitRate API] UnitRate Page Loaded',
	UnitRatePageCancelled = '[UnitRate API] UnitRate Page Cancelled',
	UnitRatePageToggleLoading = '[UnitRate] UnitRate Page Toggle Loading',
	UnitRateActionToggleLoading = '[UnitRate] UnitRate Action Toggle Loading'
}
export class UnitRateOnServerCreated implements Action {
	readonly type = UnitRateActionTypes.UnitRateOnServerCreated;
	constructor(public payload: { unitrate: UnitRateModel }) { }
}

export class UnitRateCreated implements Action {
	readonly type = UnitRateActionTypes.UnitRateCreated;
	constructor(public payload: { unitrate: UnitRateModel }) { }
}


export class UnitRateUpdated implements Action {
	readonly type = UnitRateActionTypes.UnitRateUpdated;
	constructor(public payload: {
		partialUnitRate: Update<UnitRateModel>,
		unitrate: UnitRateModel
	}) { }
}

export class UnitRateDeleted implements Action {
	readonly type = UnitRateActionTypes.UnitRateDeleted;

	constructor(public payload: { id: string }) {}
}

export class UnitRatePageRequested implements Action {
	readonly type = UnitRateActionTypes.UnitRatePageRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class UnitRatePageLoaded implements Action {
	readonly type = UnitRateActionTypes.UnitRatePageLoaded;
	constructor(public payload: { unitrate: UnitRateModel[], totalCount: number, page: QueryParamsModel  }) { }
}


export class UnitRatePageCancelled implements Action {
	readonly type = UnitRateActionTypes.UnitRatePageCancelled;
}

export class UnitRatePageToggleLoading implements Action {
	readonly type = UnitRateActionTypes.UnitRatePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class UnitRateActionToggleLoading implements Action {
	readonly type = UnitRateActionTypes.UnitRateActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type UnitRateActions = UnitRateCreated
	| UnitRateUpdated
	| UnitRateDeleted
	| UnitRateOnServerCreated
	| UnitRatePageLoaded
	| UnitRatePageCancelled
	| UnitRatePageToggleLoading
	| UnitRatePageRequested
	| UnitRateActionToggleLoading;
