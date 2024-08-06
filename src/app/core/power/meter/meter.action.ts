// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { PowerMeterModel } from './meter.model';
// Models
import {QueryPowerMeterModel} from './querymeter.model';

export enum PowerMeterActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	PowerMeterOnServerCreated = '[Edit PowerMeter Component] PowerMeter On Server Created',
	PowerMeterCreated = '[Edit PowerMeter Dialog] PowerMeter Created',
	PowerMeterUpdated = '[Edit PowerMeter Dialog] PowerMeter Updated',
	PowerMeterDeleted = '[PowerMeter List Page] PowerMeter Deleted',
	PowerMeterPageRequested = '[PowerMeter List Page] PowerMeter Page Requested',
	PowerMeterPageLoaded = '[PowerMeter API] PowerMeter Page Loaded',
	PowerMeterPageCancelled = '[PowerMeter API] PowerMeter Page Cancelled',
	PowerMeterPageToggleLoading = '[PowerMeter] PowerMeter Page Toggle Loading',
	PowerMeterActionToggleLoading = '[PowerMeter] PowerMeter Action Toggle Loading'
}
export class PowerMeterOnServerCreated implements Action {
	readonly type = PowerMeterActionTypes.PowerMeterOnServerCreated;
	constructor(public payload: { powermeter: PowerMeterModel }) { }
}

export class PowerMeterCreated implements Action {
	readonly type = PowerMeterActionTypes.PowerMeterCreated;
	constructor(public payload: { powermeter: PowerMeterModel }) { }
}


export class PowerMeterUpdated implements Action {
	readonly type = PowerMeterActionTypes.PowerMeterUpdated;
	constructor(public payload: {
		partialPowerMeter: Update<PowerMeterModel>,
		powermeter: PowerMeterModel
	}) { }
}

export class PowerMeterDeleted implements Action {
	readonly type = PowerMeterActionTypes.PowerMeterDeleted;

	constructor(public payload: { id: string }) {}
}

export class PowerMeterPageRequested implements Action {
	readonly type = PowerMeterActionTypes.PowerMeterPageRequested;
	constructor(public payload: { page: QueryPowerMeterModel }) { }
}

export class PowerMeterPageLoaded implements Action {
	readonly type = PowerMeterActionTypes.PowerMeterPageLoaded;
	constructor(public payload: { powermeter: PowerMeterModel[], totalCount: number, page: QueryPowerMeterModel  }) { }
}


export class PowerMeterPageCancelled implements Action {
	readonly type = PowerMeterActionTypes.PowerMeterPageCancelled;
}

export class PowerMeterPageToggleLoading implements Action {
	readonly type = PowerMeterActionTypes.PowerMeterPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class PowerMeterActionToggleLoading implements Action {
	readonly type = PowerMeterActionTypes.PowerMeterActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type PowerMeterActions = PowerMeterCreated
	| PowerMeterUpdated
	| PowerMeterDeleted
	| PowerMeterOnServerCreated
	| PowerMeterPageLoaded
	| PowerMeterPageCancelled
	| PowerMeterPageToggleLoading
	| PowerMeterPageRequested
	| PowerMeterActionToggleLoading;
