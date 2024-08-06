import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ComPowerModel } from './comPower.model';
import { QueryComPowerModel } from './querycomPower.model';

export enum ComPowerActionTypes {
	AllUsersRequested = '[Block Module] All ComPower Requested',
	AllUsersLoaded = '[Block API] All ComPower Loaded',
	ComPowerOnServerCreated = '[Edit ComPower Component] ComPower On Server Created',
	ComPowerCreated = '[Edit ComPower Dialog] ComPower Created',
	ComPowerUpdated = '[Edit ComPower Dialog] ComPower Updated',
	ComPowerDeleted = '[ComPower List Page] ComPower Deleted',
	ComPowerPageRequested = '[ComPower List Page] ComPower Page Requested',
	ComPowerPageLoaded = '[ComPower API] ComPower Page Loaded',
	ComPowerPageCancelled = '[ComPower API] ComPower Page Cancelled',
	ComPowerPageToggleLoading = '[ComPower] ComPower Page Toggle Loading',
	ComPowerActionToggleLoading = '[ComPower] ComPower Action Toggle Loading'
}
export class ComPowerOnServerCreated implements Action {
	readonly type = ComPowerActionTypes.ComPowerOnServerCreated;
	constructor(public payload: { comPower: ComPowerModel }) { }
}
export class ComPowerCreated implements Action {
	readonly type = ComPowerActionTypes.ComPowerCreated;
	constructor(public payload: { comPower: ComPowerModel }) { }
}
export class ComPowerUpdated implements Action {
	readonly type = ComPowerActionTypes.ComPowerUpdated;
	constructor(public payload: {
		partialComPower: Update<ComPowerModel>,
		comPower: ComPowerModel
	}) { }
}
export class ComPowerDeleted implements Action {
	readonly type = ComPowerActionTypes.ComPowerDeleted;

	constructor(public payload: { id: string }) {}
}
export class ComPowerPageRequested implements Action {
	readonly type = ComPowerActionTypes.ComPowerPageRequested;
	constructor(public payload: { page: QueryComPowerModel }) { }
}
export class ComPowerPageLoaded implements Action {
	readonly type = ComPowerActionTypes.ComPowerPageLoaded;
	constructor(public payload: { comPower: ComPowerModel[], totalCount: number, page: QueryComPowerModel  }) { }
}
export class ComPowerPageCancelled implements Action {
	readonly type = ComPowerActionTypes.ComPowerPageCancelled;
}
export class ComPowerPageToggleLoading implements Action {
	readonly type = ComPowerActionTypes.ComPowerPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class ComPowerActionToggleLoading implements Action {
	readonly type = ComPowerActionTypes.ComPowerActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type ComPowerActions = ComPowerCreated
	| ComPowerUpdated
	| ComPowerDeleted
	| ComPowerOnServerCreated
	| ComPowerPageLoaded
	| ComPowerPageCancelled
	| ComPowerPageToggleLoading
	| ComPowerPageRequested
	| ComPowerActionToggleLoading;
