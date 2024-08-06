// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { WaterMeterModel } from './meter.model';
// Models
import {QueryWaterMeterModel} from './querymeter.model';

export enum WaterMeterActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	WaterMeterOnServerCreated = '[Edit WaterMeter Component] WaterMeter On Server Created',
	WaterMeterCreated = '[Edit WaterMeter Dialog] WaterMeter Created',
	WaterMeterUpdated = '[Edit WaterMeter Dialog] WaterMeter Updated',
	WaterMeterDeleted = '[WaterMeter List Page] WaterMeter Deleted',
	WaterMeterPageRequested = '[WaterMeter List Page] WaterMeter Page Requested',
	WaterMeterPageLoaded = '[WaterMeter API] WaterMeter Page Loaded',
	WaterMeterPageCancelled = '[WaterMeter API] WaterMeter Page Cancelled',
	WaterMeterPageToggleLoading = '[WaterMeter] WaterMeter Page Toggle Loading',
	WaterMeterActionToggleLoading = '[WaterMeter] WaterMeter Action Toggle Loading'
}
export class WaterMeterOnServerCreated implements Action {
	readonly type = WaterMeterActionTypes.WaterMeterOnServerCreated;
	constructor(public payload: { watermeter: WaterMeterModel }) { }
}

export class WaterMeterCreated implements Action {
	readonly type = WaterMeterActionTypes.WaterMeterCreated;
	constructor(public payload: { watermeter: WaterMeterModel }) { }
}


export class WaterMeterUpdated implements Action {
	readonly type = WaterMeterActionTypes.WaterMeterUpdated;
	constructor(public payload: {
		partialWaterMeter: Update<WaterMeterModel>,
		watermeter: WaterMeterModel
	}) { }
}

export class WaterMeterDeleted implements Action {
	readonly type = WaterMeterActionTypes.WaterMeterDeleted;

	constructor(public payload: { id: string }) {}
}

export class WaterMeterPageRequested implements Action {
	readonly type = WaterMeterActionTypes.WaterMeterPageRequested;
	constructor(public payload: { page: QueryWaterMeterModel }) { }
}

export class WaterMeterPageLoaded implements Action {
	readonly type = WaterMeterActionTypes.WaterMeterPageLoaded;
	constructor(public payload: { watermeter: WaterMeterModel[], totalCount: number, page: QueryWaterMeterModel  }) { }
}


export class WaterMeterPageCancelled implements Action {
	readonly type = WaterMeterActionTypes.WaterMeterPageCancelled;
}

export class WaterMeterPageToggleLoading implements Action {
	readonly type = WaterMeterActionTypes.WaterMeterPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class WaterMeterActionToggleLoading implements Action {
	readonly type = WaterMeterActionTypes.WaterMeterActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type WaterMeterActions = WaterMeterCreated
	| WaterMeterUpdated
	| WaterMeterDeleted
	| WaterMeterOnServerCreated
	| WaterMeterPageLoaded
	| WaterMeterPageCancelled
	| WaterMeterPageToggleLoading
	| WaterMeterPageRequested
	| WaterMeterActionToggleLoading;
