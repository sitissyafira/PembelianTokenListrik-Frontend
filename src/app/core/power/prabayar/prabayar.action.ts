// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { PowerPrabayarModel } from './prabayar.model';
// Models
import {QueryPowerPrabayarModel} from './queryprabayar.model';

export enum PowerPrabayarActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	PowerPrabayarOnServerCreated = '[Edit PowerPrabayar Component] PowerPrabayar On Server Created',
	PowerPrabayarCreated = '[Edit PowerPrabayar Dialog] PowerPrabayar Created',
	PowerPrabayarUpdated = '[Edit PowerPrabayar Dialog] PowerPrabayar Updated',
	PowerPrabayarDeleted = '[PowerPrabayar List Page] PowerPrabayar Deleted',
	PowerPrabayarPageRequested = '[PowerPrabayar List Page] PowerPrabayar Page Requested',
	PowerPrabayarPageLoaded = '[PowerPrabayar API] PowerPrabayar Page Loaded',
	PowerPrabayarPageCancelled = '[PowerPrabayar API] PowerPrabayar Page Cancelled',
	PowerPrabayarPageToggleLoading = '[PowerPrabayar] PowerPrabayar Page Toggle Loading',
	PowerPrabayarActionToggleLoading = '[PowerPrabayar] PowerPrabayar Action Toggle Loading'
}
export class PowerPrabayarOnServerCreated implements Action {
	readonly type = PowerPrabayarActionTypes.PowerPrabayarOnServerCreated;
	constructor(public payload: { powerprabayar: PowerPrabayarModel }) { }
}

export class PowerPrabayarCreated implements Action {
	readonly type = PowerPrabayarActionTypes.PowerPrabayarCreated;
	constructor(public payload: { powerprabayar: PowerPrabayarModel }) { }
}


export class PowerPrabayarUpdated implements Action {
	readonly type = PowerPrabayarActionTypes.PowerPrabayarUpdated;
	constructor(public payload: {
		partialPowerPrabayar: Update<PowerPrabayarModel>,
		powerprabayar: PowerPrabayarModel
	}) { }
}

export class PowerPrabayarDeleted implements Action {
	readonly type = PowerPrabayarActionTypes.PowerPrabayarDeleted;

	constructor(public payload: { id: string }) {}
}

export class PowerPrabayarPageRequested implements Action {
	readonly type = PowerPrabayarActionTypes.PowerPrabayarPageRequested;
	constructor(public payload: { page: QueryPowerPrabayarModel }) { }
}

export class PowerPrabayarPageLoaded implements Action {
	readonly type = PowerPrabayarActionTypes.PowerPrabayarPageLoaded;
	constructor(public payload: { powerprabayar: PowerPrabayarModel[], totalCount: number, page: QueryPowerPrabayarModel  }) { }
}


export class PowerPrabayarPageCancelled implements Action {
	readonly type = PowerPrabayarActionTypes.PowerPrabayarPageCancelled;
}

export class PowerPrabayarPageToggleLoading implements Action {
	readonly type = PowerPrabayarActionTypes.PowerPrabayarPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class PowerPrabayarActionToggleLoading implements Action {
	readonly type = PowerPrabayarActionTypes.PowerPrabayarActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type PowerPrabayarActions = PowerPrabayarCreated
	| PowerPrabayarUpdated
	| PowerPrabayarDeleted
	| PowerPrabayarOnServerCreated
	| PowerPrabayarPageLoaded
	| PowerPrabayarPageCancelled
	| PowerPrabayarPageToggleLoading
	| PowerPrabayarPageRequested
	| PowerPrabayarActionToggleLoading;
